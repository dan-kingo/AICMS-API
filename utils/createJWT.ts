import jwt, { JwtPayload } from "jsonwebtoken";

interface Payload extends JwtPayload {
  userId: string;
  role: string;
}

const createJWT = (payload: Payload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, secret, { expiresIn: "1d" });
};

const verifyJWT = (token: string): Payload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return decoded as Payload; // Explicitly assert type
};

export { verifyJWT, createJWT };
