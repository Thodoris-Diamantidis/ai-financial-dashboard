import { WelcomeEmailData } from "@/types/global";
import nodemailer from "nodemailer";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  PRICE_ALERT_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const mailOptions = {
    from: "AI-Financials",
    to: email,
    subject: "Welcome to AI-financial",
    text: "Thanks for joining",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date,
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: `AI Financial News`,
    to: email,
    subject: `Market News Summary Today - ${date}`,
    text: `Today's market news summary from AI Financial`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

interface SendPriceAlertEmailProps {
  email: string;
  company: string;
  symbol: string;
  currentPrice: string; // e.g., "$88.00"
  targetPrice: string; // e.g., "$90.00"
  option: "lt" | "gt" | "eq"; // alert type
}

export const sendPriceAlertEmail = async ({
  email,
  company,
  symbol,
  currentPrice,
  targetPrice,
  option,
}: SendPriceAlertEmailProps): Promise<void> => {
  try {
    const htmlTemplate = PRICE_ALERT_EMAIL_TEMPLATE.replace(
      "{{company}}",
      company,
    )
      .replace("{{symbol}}", symbol)
      .replace("{{currentPrice}}", currentPrice)
      .replace("{{targetPrice}}", targetPrice)
      .replace(
        "{{option}}",
        option === "lt" ? "<" : option === "gt" ? ">" : "=",
      );

    const mailOptions = {
      from: `AI Financial Alerts <no-reply@ai-financial.com>`,
      to: email,
      subject: `Price Alert: ${symbol} is ${option === "lt" ? "below" : option === "gt" ? "above" : "at"} your target`,
      text: `Price alert for ${symbol}: Current ${currentPrice}, Target ${targetPrice}`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Price alert sent to ${email} for ${symbol}`);
  } catch (err) {
    console.error(`Failed to send price alert to ${email} for ${symbol}`, err);
  }
};
