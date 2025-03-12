import { Request, Response } from "express";
import { registerFormData } from "../schemas/registerSchema";
import User from "../models/users";
import _ from "lodash";
import hashPassword from "../utils/hashPassword";

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

export { register };
