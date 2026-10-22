import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/user.model.ts";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export {};