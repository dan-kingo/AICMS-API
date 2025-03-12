import bcrypt from "bcryptjs";

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPwd = await bcrypt.hash(password, salt);
  return hashedPwd;
};

const comparePassword = async (password: string, hashPassword: string) => {
  return bcrypt.compare(password, hashPassword);
};

export { hashPassword, comparePassword };
