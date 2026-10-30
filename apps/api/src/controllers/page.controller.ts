import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { PageService } from "../services/page.service.js";
import {
  toPublicPage,
  toPublicPageSummary,
  toAdminPage,
} from "../lib/mappers/page.mapper.js";

export class PageController {
  constructor(private service: PageService) {}

  listPublic = async (_req: Request, res: Response) => {
    const pages = await this.service.listPublic();
    ResponseHandler.success(
      res,
      pages.map(toPublicPageSummary),
      "Pages fetched successfully",
    );
  };

  getBySlugPublic = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const page = await this.service.getBySlug(slug as string);
    ResponseHandler.success(
      res,
      toPublicPage(page),
      "Page fetched successfully",
    );
  };

  listAdmin = async (req: Request, res: Response) => {
    const query = req.query as Record<string, any>;
    const result = await this.service.listAdmin({
      search: query.search ? String(query.search) : undefined,
      isActive: query.isActive !== undefined ? query.isActive === "true" || query.isActive === true : undefined,
      includeDeleted:
        query.includeDeleted !== undefined
          ? query.includeDeleted === "true" || query.includeDeleted === true
          : undefined,
      page: query.page !== undefined ? Number(query.page) : undefined,
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
      sortBy: query.sortBy ? (String(query.sortBy) as any) : undefined,
      sortOrder: query.sortOrder ? (String(query.sortOrder) as any) : undefined,
    });

    ResponseHandler.success(
      res,
      {
        items: result.pages.map(toAdminPage),
        pagination: result.pagination,
      },
      "Admin pages fetched successfully",
    );
  };

  getByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = await this.service.getByIdAdmin(id as string);
    ResponseHandler.success(
      res,
      toAdminPage(page),
      "Admin page fetched successfully",
    );
  };

  create = async (req: Request, res: Response) => {
    const page = await this.service.createPage(req.body);
    ResponseHandler.created(
      res,
      toAdminPage(page),
      "Page created successfully",
    );
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = await this.service.updatePage(id as string, req.body);
    ResponseHandler.success(
      res,
      toAdminPage(page),
      "Page updated successfully",
    );
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deletePage(id as string);
    ResponseHandler.success(res, {}, "Page deleted successfully");
  };

  restore = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = await this.service.restorePage(id as string);
    ResponseHandler.success(
      res,
      toAdminPage(page),
      "Page restored successfully",
    );
  };
}
