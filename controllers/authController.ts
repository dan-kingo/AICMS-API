import { Request, Response } from "express";
import crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config();

import User from "../models/users";
import _ from "lodash";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { createJWT } from "../utils/createJWT";
import { generateOTP, sendOTP, transporter } from "../utils/mailSender";

const register = async (req: Request, res: Response) => {
  try {
    const { userName, firstName, email, password, phoneNumber } = req.body;

    let existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists!" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const newUser = new User({
      userName,
      firstName,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpires,
    });

    await newUser.save();
    await sendOTP(email, otp);
    res.cookie("email", email, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  const email = req.cookies.email;
  const { otp } = req.body;
  console.log("Received OTP:", otp, "for Email:", email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log("User not found!");
    res.status(400).json({ message: "User not found" });
    return;
  }

  console.log("Stored OTP:", user.otp);
  console.log("OTP Expiry Time:", user.otpExpires);

  if (user.otpExpires < new Date()) {
    console.log("OTP has expired!");
    res.status(400).json({ message: "OTP has expired" });
    return;
  }

  if (user.otp !== otp) {
    console.log("Invalid OTP provided!");
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  console.log("OTP Verified Successfully!");
  res.json({ success: true });
  return;
};

const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.cookies;
    console.log("Email from cookies:", email);

    if (!email) {
      console.log("No email found in cookies");
      res.status(400).json({ message: "Email not found in cookies" });
      return;
    }

    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      console.log("User not found in the database");
      res.status(400).json({ message: "User not found" });
      return;
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    console.log("OTP generated and saved:", otp);

    await sendOTP(email, otp);
    console.log("OTP sent to email:", email);

    res
      .status(200)
      .json({ success: true, message: "OTP resent successfully!" });
  } catch (error) {
    console.log("Error in resendOTP:", error); // Log the error
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });

    if (!user) {
      res.status(400).json({ message: "Invalid Username!" });
      return;
    }

    const validPassword = await comparePassword(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      res.status(400).json({ message: "Invalid password" });
      return;
    } else {
      const token = createJWT({ userId: user._id.toString(), role: user.role });

      const oneDay = 1000 * 60 * 60 * 24;
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({ success: true, message: "User logged in" });
      return;
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Password reset link sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (_req: Request, res: Response) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({
    success: true,
    message: "Successfully logged out!",
  });
};
export { register, login, logout, verifyOTP, resendOTP, forgotPassword };
