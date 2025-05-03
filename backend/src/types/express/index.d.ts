// src/types/express/index.d.ts
import { IUser } from "../../models/User"; // adjust path to your User type

export {}; // turn this file into a module

declare global {
  namespace Express {
    interface Request {
      user: IUser; // or `user?: User` if it might be undefined
    }
  }
}
