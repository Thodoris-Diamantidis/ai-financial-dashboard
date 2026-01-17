import { MarketNewsArticle, User } from "@/types/global";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";
import { getWatchlistSymbolByEmail } from "../actions/watchlistserver.actions";
import { getNews } from "../actions/finnhub.actions";
import { formatDateToday } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
  { id: "sing-up" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Name: ${event.data.name}`;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-3-flash-preview" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining us. You now have the tools to track markets and make smarter investements";

      const {
        data: { email, name },
      } = event;
      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news" },
  [{ event: "app/send.daily.news" }, { cron: "* 12 * * *" }],
  async ({ step }) => {
    //Step #1: Get all users for news delivery
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users.length === 0)
      return { success: false, message: "No users found " };
    //Step #2: Fetch personalised news for each user
    const results = await step.run("fetch-news", async () => {
      const perUser: Array<{ user: any; articles: MarketNewsArticle[] }> = [];
      for (const user of users) {
        try {
          const symbols = await getWatchlistSymbolByEmail(user.email);
          let articles = await getNews(symbols);
          //Enforce max 6
          articles = (articles || []).slice(0, 6);
          //If empty fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (err) {
          console.error("Daily news: error preparing news", user.email, err);
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });
    //Step #3: Summarize these news via AI for each user
    const userNewsSummaries: { user: User; newsContent: string | null }[] = [];
    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2)
        );
        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-3-flash-preview" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news";

        userNewsSummaries.push({ user, newsContent });
      } catch (err) {
        console.error("Failed to summarize news for: ", user.email);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }
    //Step #4: Send emails
    await step.run("send-news-email", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: formatDateToday,
            newsContent,
          });
        })
      );
    });
    return { succes: true, message: `Daily news summary send succesfully` };
  }
);
