import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { AdminUserService } from "../services/adminUser.service.js";

export class AdminUserController {
  constructor(private service: AdminUserService) {}

  list = async (req: Request, res: Response) => {
    // Validated query values are not written back to req.query, so parse numbers here.
    const q = req.query as Record<string, string | undefined>;
    const page = Number.parseInt(q.page ?? "", 10);
    const limit = Number.parseInt(q.limit ?? "", 10);
    const data = await this.service.list({
      page: Number.isFinite(page) && page > 0 ? page : undefined,
      limit:
        Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : undefined,
      search: q.search,
      role: q.role as "ADMIN" | "MODERATOR" | "USER" | undefined,
      status: q.status as "ACTIVE" | "INACTIVE" | "DELETED" | undefined,
      sortBy: q.sortBy as "createdAt" | "name" | "email" | undefined,
      sortOrder: q.sortOrder as "asc" | "desc" | undefined,
    });
    ResponseHandler.success(res, data, "Users fetched successfully");
  };

  getById = async (req: Request, res: Response) => {
    const user = await this.service.getById(req.params.id as string);
    ResponseHandler.success(res, user, "User fetched successfully");
  };

  updateStatus = async (req: Request, res: Response) => {
    const result = await this.service.changeStatus(
      req.user!,
      req.params.id as string,
      req.body.status,
    );
    ResponseHandler.success(res, result, "User status updated successfully");
  };

  remove = async (req: Request, res: Response) => {
    await this.service.changeStatus(
      req.user!,
      req.params.id as string,
      "DELETED",
    );
    ResponseHandler.success(res, {}, "User deleted successfully");
  };
}
