import { MarketNewsArticle, User } from "@/types/global";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import {
  sendNewsSummaryEmail,
  sendPriceAlertEmail,
  sendWelcomeEmail,
} from "../nodemailer";
import { inngest } from "./client";
import {
  FAVORITE_STOCKS_AI_PROMPT,
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";
import { getWatchlistSymbolByEmail } from "../actions/watchlistserver.actions";
import { getNews, getStocksDetails } from "../actions/finnhub.actions";
import { formatDateToday } from "../utils";
import clientPromise from "../mongodb";

export const sendSignUpEmail = inngest.createFunction(
  { id: "sing-up" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Name: ${event.data.name}`;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile,
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
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
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
          JSON.stringify(articles, null, 2),
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
        }),
      );
    });
    return { succes: true, message: `Daily news summary send succesfully` };
  },
);

export const sendPriceAlerts = inngest.createFunction(
  { id: "price-alerts" },
  [{ event: "app/send.price-alerts" }, { cron: "0 12 * * * " }],
  async ({ step }) => {
    // Step #1: Get all users
    //We use the same method for newsEmail because it returns all we need
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users.length === 0)
      return { success: false, message: "No users found " };

    for (const user of users) {
      const alerts = user.alerts || [];
      //step for testing purposes
      // await step.run(`log-alerts-${user.email}`, async () => {
      //   console.log("User:", user.email);
      //   console.log("Alerts:", user.alerts);
      // });
      if (!alerts.length) continue;

      // Collect triggered alerts for this user
      const triggeredAlerts: Array<{
        symbol: string;
        company: string;
        currentPrice: number;
        targetPrice: number;
        option: "lt" | "gt" | "eq";
      }> = [];

      for (const alert of alerts) {
        try {
          const liveData = await getStocksDetails(alert.symbol);
          if (!liveData) continue;

          const livePrice = liveData.currentPrice;

          let triggered = false;
          switch (alert.option) {
            case "lt":
              triggered = livePrice < alert.targetPrice;
              break;
            case "gt":
              triggered = livePrice > alert.targetPrice;
              break;
            case "eq":
              triggered = livePrice === alert.targetPrice;
              break;
          }

          if (triggered) {
            triggeredAlerts.push({
              symbol: alert.symbol,
              company: liveData.company,
              currentPrice: livePrice,
              targetPrice: alert.targetPrice,
              option: alert.option,
            });
          }
        } catch (err) {
          console.error(
            `Error checking alert for ${user.email} ${alert.symbol}`,
            err,
          );
        }
      }

      if (triggeredAlerts.length > 0) {
        await step.run("send-price-alert-email", async () => {
          for (const alert of triggeredAlerts) {
            try {
              await sendPriceAlertEmail({
                email: user.email,
                company: alert.company,
                symbol: alert.symbol,
                currentPrice: alert.currentPrice.toString(),
                targetPrice: alert.targetPrice.toString(),
                option: alert.option,
              });
              console.log(
                `Price alert sent to ${user.email} for ${alert.symbol}`,
              );
            } catch (err) {
              console.error(`Failed to send alert email to ${user.email}`, err);
            }
          }
        });
      }
    }
    return { success: true, message: "Price alerts processed" };
  },
);

export const favoriteStocksAI = inngest.createFunction(
  { id: "ai-stock-analysis" },
  { event: "ai/favorite-stock-analysis" },
  async ({ event, step }) => {
    const { userId, questionType, symbol } = event.data;

    // Step 1# Basic validation
    if (!userId || !questionType || !symbol) {
      throw new Error("Invalid event payload");
    }
    // Step 1.5# log received question for debug
    await step.run("log-input", async () => {
      console.log("AI stock analysis triggered:", {
        userId,
        questionType,
        symbol,
      });
    });
    //step 2#  since the event trigger is gonna happen from the UI,
    // the questions are gonna come from a select box with 2-3opitons and then a panel to choose from which STOCK after that
    //  fetch details about the stock(does finnhub have a endpoint to get price data for a whole month thats what i want?)
    const stockData = await step.run("fetch-stock-data", async () => {
      const now = new Date();
      const from = new Date();
      from.setDate(now.getDate() - 30);

      const fromStr = from.toISOString().split("T")[0];
      const toStr = now.toISOString().split("T")[0];

      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&limit=30&apiKey=${process.env.POLYGON_API_KEY}`,
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Polygon error: ${text}`);
      }

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No price data returned from Polygon");
      }

      return data.results.map((d: any) => ({
        date: new Date(d.t).toISOString().split("T")[0],
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
        volume: d.v,
      }));
    });
    //step 3# with the question and the fetched data ask ai to generate a respone
    let aiResponse = "";
    try {
      const prompt = FAVORITE_STOCKS_AI_PROMPT.replace(
        "{{question}}",
        questionType,
      )
        .replace("{{stockData}}", JSON.stringify(stockData, null, 2))
        .replace("{{symbol}}", symbol);
      const response = await step.ai.infer("Ai-answer", {
        model: step.ai.models.gemini({ model: "gemini-3-flash-preview" }),
        body: {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      aiResponse = (part && "text" in part ? part.text : null) || "No idea";
    } catch (err) {
      console.error("Failed to get an answer", err);
    }

    //save to db
    const client = await clientPromise;
    const db = client.db("ai_finance");
    await db.collection("ai_runs").insertOne({
      userId,
      symbol,
      questionType,
      result: aiResponse,
      status: "completed",
      createdAt: new Date(),
    });

    return { success: true };
  },
);
