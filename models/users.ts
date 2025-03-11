import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: String,
  email: String,
  phoneNumber: Number,
  password: String,
  confirmPassword: String,
});

const User = mongoose.model("User", userSchema);

export default User;
