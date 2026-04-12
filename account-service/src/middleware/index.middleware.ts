import { PUBLIC_ACTIONS } from "../actions/index.actions";
import jwt from "jsonwebtoken";

export const authMiddleware = async (
  payload: any,
  handler: any,
  next: (payload: any) => void
) => {
  try {

    // Allow public actions
    if (PUBLIC_ACTIONS.includes(payload.action)) {
      return next(payload);
    }

    const token = payload.token;
    if (!token) {
      return handler.reply(null, {
        message: "Unauthorized",
        status: false,
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return handler.reply(null, {
        message: "Internal Server Error",
        status: false,
      });
    }

    const decodedToken = jwt.verify(token, secret);
    payload.user = decodedToken;

    // Pass payload to the next handler
    next(payload);
  } catch (err) {
    return handler.reply(null, { message: "Unauthorized", status: false });
  }
};
