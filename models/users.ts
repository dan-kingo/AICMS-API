import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: String,
  email: String,
  otp: {
    type: String,
    optional: true,
  },
  otpExpires: {
    type: Date,
    optional: true,
  },
  isVerified: { type: Boolean, optional: true },
  resetToken: {
    type: String,
    optional: true,
  },
  resetTokenExpires: {
    type: Number,
    optional: true,
  },
  phoneNumber: Number,
  role: {
    type: String,
    default: "user",
  },
  password: String,
  confirmPassword: String,
});

const User = mongoose.model("User", userSchema);

export default User;
