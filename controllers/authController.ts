import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

import User from "../models/users";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { createJWT } from "../utils/createJWT";
import { generateOTP, sendOTP, transporter } from "../utils/mailSender";

const register = async (req: Request, res: Response) => {
  try {
    const { userName, firstName, lastName, email, password, phoneNumber } =
      req.body;

    let existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists!" });
      return;
    }

    const isFirstThreeAccount = (await User.countDocuments()) < 3;

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

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

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  if (user.otpExpires < new Date()) {
    res.status(400).json({ message: "OTP has expired" });
    return;
  }

  if (user.otp !== otp) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

  await user.save(); // ✅ Save the change

  res.json({ success: true, message: "OTP verified successfully!" });
};

const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.cookies;

    if (!email) {
      res.status(400).json({ message: "Email not found in cookies" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp);

    res
      .status(200)
      .json({ success: true, message: "OTP resent successfully!" });
  } catch (error) {
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

    if (!user.isVerified) {
      res
        .status(403)
        .json({ message: "Please verify your OTP before logging in." });
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

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<h1>Reset Your Password</h1>
      <p>Click on the following link to reset your password:</p>
      <a href="http://localhost:5173/reset-password/${resetToken}">${resetLink}</a>
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
  });
  res.status(200).json({
    success: true,
    message: "Successfully logged out!",
  });
};

export {
  register,
  login,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
