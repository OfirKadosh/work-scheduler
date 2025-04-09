import { JwtPayload } from "../../middleware/auth"; // או מאיפה שהגדרת אותו

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
