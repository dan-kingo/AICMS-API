import { Request, Response } from "express";
import { registerFormData } from "../schemas/registerSchema";
import User from "../models/users";
import _ from "lodash";

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
    const user = await User.create(
      _.pick(userData, [
        "firstName",
        "lastName",
        "email",
        "password",
        "userName",
        "role",
      ])
    );
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Internal server Error!" });
  }
};

export { register };
