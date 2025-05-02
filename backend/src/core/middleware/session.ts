import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,             // Must be false on HTTP (localhost)
    httpOnly: true,
    sameSite: "lax",           // Or "none" if using HTTPS and cross-site
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
});
