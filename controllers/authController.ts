import { Request, Response } from "express";
import { registerFormData } from "../schemas/registerSchema";
import User from "../models/users";
import _ from "lodash";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { createJWT } from "../utils/createJWT";

const register = async (req: Request<registerFormData>, res: Response) => {
  try {
    const isFirstThreeAccount = (await User.countDocuments()) < 3;
    const userData: registerFormData = {
      ...req.body,
      role: isFirstThreeAccount ? "admin" : "user",
    };

    let registeredUserName = await User.findOne({
      userName: req.body.userName,
    });
    let registeredUserEmail = await User.findOne({ email: req.body.email });
    if (registeredUserName || registeredUserEmail) {
      res.status(400).json({ message: "User already registered!" });
      return;
    }

    // hash password
    const hashPwd = await hashPassword(req.body.password);
    userData.password = hashPwd;

    const user = await User.create(userData);
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server Error!" });
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
export { register, login, logout };
