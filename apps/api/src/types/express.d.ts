import { UserRoles } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRoles };
      /** Raw request bytes, captured only for webhook routes that verify signatures. */
      rawBody?: Buffer;
    }
  }
}
