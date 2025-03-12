import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
  role: string;
  [key: string]: any;
}

const createJWT = (payload: Payload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    return jwt.sign(payload, secret, {
      expiresIn: "1d",
    });
  } catch (error) {
    throw new Error("Error creating JWT: " + error.message);
  }
};

export default createJWT;
