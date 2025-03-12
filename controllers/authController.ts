import { Request, Response } from "express";
import { registerFormData } from "../schemas/registerSchema";
import User from "../models/users";
import _ from "lodash";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import createJWT from "../utils/createJWT";

const register = async (req: Request<registerFormData>, res: Response) => {
  try {
    const isFirstThreeAccount = (await User.countDocuments()) < 3;
    const userData: registerFormData = {
      ...req.body,
      role: isFirstThreeAccount ? "admin" : "user",
    };

    let registeredUser = await User.findOne({ email: req.body.email });
    if (registeredUser) {
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
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(400).json({ message: "Invalid email address" });
    }

    const validPassword = await comparePassword(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      res.status(400).json({ message: "Invalid password" });
    } else {
      const token = createJWT({ userId: user._id.toString(), role: user.role });

      const oneDay = 1000 * 60 * 60 * 24;
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({ success: true, message: "User logged in" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export { register, login };
