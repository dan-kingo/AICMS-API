import crypto from "crypto";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: process.env.MAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = (): string => crypto.randomInt(100000, 999999).toString();

const sendOTP = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `<h1>Your OTP code  is: ${otp}.</h1> It will expire in 5 minutes.`,
    });
    console.log("OTP sent successfully!");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

export { generateOTP, sendOTP };
