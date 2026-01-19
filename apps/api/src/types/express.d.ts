import { UserRoles } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRoles };
    }
  }
}
