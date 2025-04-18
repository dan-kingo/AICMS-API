import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

import User from "../models/users.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { createJWT } from "../utils/createJWT.js";
import { generateOTP, sendOTP, transporter } from "../utils/mailSender.js";

const register = async (req: Request, res: Response) => {
  try {
    const { userName, firstName, lastName, email, password, phoneNumber } =
      req.body;

    console.log("[REGISTER] Incoming registration request for:", email);

    if (
      !userName ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber
    ) {
      console.warn("[REGISTER] Missing required fields");
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      console.warn("[REGISTER] User already exists:", email);
      res.status(400).json({ message: "Email or username already exists!" });
      return;
    }

    const isFirstThreeAccount = (await User.countDocuments()) < 3;
    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const newUser = new User({
      userName,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpires,
      role: isFirstThreeAccount ? "admin" : "user",
    });

    await newUser.save();
    console.log("[REGISTER] User saved successfully:", email);

    await sendOTP(email, otp);
    console.log("[REGISTER] OTP sent to:", email);

    res.cookie("email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    });

    res.status(201).json({ success: true, message: "OTP sent to your email." });
    return;
  } catch (error: any) {
    console.error("[REGISTER] Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
    return;
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  try {
    const email = req.cookies.email;
    const { otp } = req.body;

    console.log("[VERIFY OTP] Email from cookie:", email);
    console.log("[VERIFY OTP] Provided OTP:", otp);

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    console.log("[VERIFY OTP] Stored OTP:", user.otp);

    if (user.otp !== otp.toString()) {
      res.status(400).json({ message: "Invalid OTP, please try again." });
      return;
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log("[VERIFY OTP] OTP verified for:", email);

    res.json({ success: true, message: "OTP verified successfully!" });
    return;
  } catch (error: any) {
    console.error("[VERIFY OTP] Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
    return;
  }
};

const resendOTP = async (req: Request, res: Response) => {
  try {
    const email = req.cookies.email;
    console.log("[RESEND OTP] Email from cookie:", email);

    if (!email) {
      res.status(400).json({ message: "Email not found in cookies." });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const newOTP = generateOTP();
    user.otp = newOTP;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTP(email, newOTP);
    console.log("[RESEND OTP] New OTP sent to:", email);

    res.json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
    return;
  } catch (error: any) {
    console.error("[RESEND OTP] Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
    return;
  }
};

const adminLogin = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });

    if (!user) {
      res.status(400).json({ message: "Invalid Username!" });
      return;
    }
    if (user.role === "user") {
      res.status(400).json({ message: "Invalid User!" });
      return;
    }

    if (!user.isVerified) {
      res
        .status(403)
        .json({ message: "Please verify your OTP before logging in." });
      return;
    }

    if (!user?.password) {
      res.status(400).json({ message: "Invalid Password!" });
      return;
    }

    const validPassword = await comparePassword(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    const token = createJWT({ userId: user._id.toString(), role: user.role });

    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "User logged in",
      token,
      role: user.role,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });

    if (!user) {
      res.status(400).json({ message: "Invalid Username!" });
      return;
    }

    if (user.role !== "user") {
      res.status(400).json({ message: "Invalid User!" });
      return;
    }

    if (!user.isVerified) {
      res
        .status(403)
        .json({ message: "Please verify your OTP before logging in." });
      return;
    }
    if (!user?.password) {
      res.status(400).json({ message: "Invalid Password!" });
      return;
    }

    const validPassword = await comparePassword(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    const token = createJWT({ userId: user._id.toString(), role: user.role });

    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "User logged in",
      token,
      role: user.role,
    });
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

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "10m",
    });

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email || "kabebe1123@gmail.com",
      subject: "Password Reset Request",
      html: `<h1>Reset Your Password</h1>
      <p>Click on the following link to reset your password:</p>
      <a href="https://eeucms.netlify.app/reset-password/${resetToken}">${resetLink}</a>
      <p>The link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Password reset link sent!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error resetting password" });
  }
};

const logout = async (_req: Request, res: Response) => {
  res.cookie("token", "logout", {
    expires: new Date(Date.now()),
    sameSite: "none",
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Successfully logged out!",
  });
};

export {
  register,
  login,
  adminLogin,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
