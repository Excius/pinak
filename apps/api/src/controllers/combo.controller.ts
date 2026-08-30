import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { ComboService } from "../services/combo.service.js";
import {
  toAdminComboKit,
  toAdminComboKitItem,
  toAdminComboKitItems,
  toAdminComboKitList,
  toPublicComboKit,
  toPublicComboKitItems,
  toPublicComboKitList,
} from "../lib/mappers/comboKit.mapper.js";

export class ComboController {
  constructor(private comboService: ComboService) {}

  getComboKits = async (req: Request, res: Response) => {
    const result = await this.comboService.getComboKits({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      isActive: true,
      search: req.query.search ? String(req.query.search) : undefined,
      tags: req.query.tags
        ? String(req.query.tags)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sortBy: req.query.sortBy
        ? (String(req.query.sortBy) as
            | "createdAt"
            | "updatedAt"
            | "price"
            | "sortOrder"
            | "viewCount"
            | "purchasedCount")
        : undefined,
      sortOrder: req.query.sortOrder
        ? (String(req.query.sortOrder) as "asc" | "desc")
        : undefined,
    });

    ResponseHandler.success(
      res,
      toPublicComboKitList(result),
      "Combo kits fetched successfully",
    );
  };

  getComboKitById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.getComboKitById(id as string);

    if (!comboKit) {
      return ResponseHandler.notFound(res, "Combo kit not found");
    }

    ResponseHandler.success(
      res,
      toPublicComboKit(comboKit),
      "Combo kit fetched successfully",
    );
  };

  getComboKitBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const comboKit = await this.comboService.getComboKitBySlug(slug as string);

    if (!comboKit) {
      return ResponseHandler.notFound(res, "Combo kit not found");
    }

    ResponseHandler.success(
      res,
      toPublicComboKit(comboKit),
      "Combo kit fetched successfully",
    );
  };

  searchComboKits = async (req: Request, res: Response) => {
    const result = await this.comboService.searchComboKits(
      String(req.query.q),
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
      true,
    );

    ResponseHandler.success(
      res,
      toPublicComboKitList(result),
      "Combo kits fetched successfully",
    );
  };

  getComboKitItems = async (req: Request, res: Response) => {
    const { id } = req.params;
    const items = await this.comboService.getComboKitItems(id as string);
    ResponseHandler.success(
      res,
      toPublicComboKitItems(items),
      "Combo kit items fetched successfully",
    );
  };

  getAllComboKitsAdmin = async (req: Request, res: Response) => {
    const result = await this.comboService.getAllComboKitsAdmin({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      search: req.query.search ? String(req.query.search) : undefined,
      sortBy: req.query.sortBy
        ? (String(req.query.sortBy) as
            | "createdAt"
            | "updatedAt"
            | "price"
            | "sortOrder"
            | "viewCount"
            | "purchasedCount")
        : undefined,
      sortOrder: req.query.sortOrder
        ? (String(req.query.sortOrder) as "asc" | "desc")
        : undefined,
    });

    ResponseHandler.success(
      res,
      toAdminComboKitList(result),
      "All combo kits fetched successfully",
    );
  };

  getDeletedComboKitsAdmin = async (req: Request, res: Response) => {
    const result = await this.comboService.getDeletedComboKitsAdmin({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      search: req.query.search ? String(req.query.search) : undefined,
      sortBy: req.query.sortBy
        ? (String(req.query.sortBy) as
            | "createdAt"
            | "updatedAt"
            | "price"
            | "sortOrder"
            | "viewCount"
            | "purchasedCount")
        : undefined,
      sortOrder: req.query.sortOrder
        ? (String(req.query.sortOrder) as "asc" | "desc")
        : undefined,
    });

    ResponseHandler.success(
      res,
      toAdminComboKitList(result),
      "Deleted combo kits fetched successfully",
    );
  };

  getInactiveComboKitsAdmin = async (req: Request, res: Response) => {
    const result = await this.comboService.getInactiveComboKitsAdmin({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      search: req.query.search ? String(req.query.search) : undefined,
      sortBy: req.query.sortBy
        ? (String(req.query.sortBy) as
            | "createdAt"
            | "updatedAt"
            | "price"
            | "sortOrder"
            | "viewCount"
            | "purchasedCount")
        : undefined,
      sortOrder: req.query.sortOrder
        ? (String(req.query.sortOrder) as "asc" | "desc")
        : undefined,
    });

    ResponseHandler.success(
      res,
      toAdminComboKitList(result),
      "Inactive combo kits fetched successfully",
    );
  };

  getComboKitByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.getComboKitByIdAdmin(id as string);
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit fetched successfully",
    );
  };

  createComboKit = async (req: Request, res: Response) => {
    const comboKit = await this.comboService.createComboKit(req.body);
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit created successfully",
    );
  };

  updateComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.updateComboKit(
      id as string,
      req.body,
    );
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit updated successfully",
    );
  };

  updateComboKitStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.updateComboKitStatus(
      id as string,
      req.body,
    );
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit status updated successfully",
    );
  };

  updateComboKitPricing = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.updateComboKitPricing(
      id as string,
      req.body,
    );
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit pricing updated successfully",
    );
  };

  updateComboKitMetadata = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.updateComboKitMetadata(
      id as string,
      req.body,
    );
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit metadata updated successfully",
    );
  };

  addComboKitItem = async (req: Request, res: Response) => {
    const { comboKitId } = req.params;
    const item = await this.comboService.addComboKitItem(
      comboKitId as string,
      req.body,
    );
    ResponseHandler.success(
      res,
      toAdminComboKitItem(item),
      "Combo kit item added successfully",
    );
  };

  updateComboKitItem = async (req: Request, res: Response) => {
    const { comboKitId, itemId } = req.params;
    const item = await this.comboService.updateComboKitItem(
      comboKitId as string,
      itemId as string,
      req.body,
    );
    ResponseHandler.success(
      res,
      toAdminComboKitItem(item),
      "Combo kit item updated successfully",
    );
  };

  removeComboKitItem = async (req: Request, res: Response) => {
    const { comboKitId, itemId } = req.params;
    await this.comboService.removeComboKitItem(
      comboKitId as string,
      itemId as string,
    );
    ResponseHandler.success(res, {}, "Combo kit item removed successfully");
  };

  reorderComboKitItems = async (req: Request, res: Response) => {
    const { comboKitId } = req.params;
    const items = await this.comboService.reorderComboKitItems(
      comboKitId as string,
      req.body.items,
    );
    ResponseHandler.success(
      res,
      toAdminComboKitItems(items),
      "Combo kit items reordered successfully",
    );
  };

  bulkSetComboKitItems = async (req: Request, res: Response) => {
    const { comboKitId } = req.params;
    const items = await this.comboService.bulkSetComboKitItems(
      comboKitId as string,
      req.body.items,
    );
    ResponseHandler.success(
      res,
      toAdminComboKitItems(items),
      "Combo kit items replaced successfully",
    );
  };

  softDeleteComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.softDeleteComboKit(id as string);
    ResponseHandler.success(res, {}, "Combo kit deleted successfully");
  };

  restoreComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const comboKit = await this.comboService.restoreComboKit(id as string);
    ResponseHandler.success(
      res,
      toAdminComboKit(comboKit),
      "Combo kit restored successfully",
    );
  };

  hardDeleteComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.hardDeleteComboKit(id as string);
    ResponseHandler.success(
      res,
      {},
      "Combo kit permanently deleted successfully",
    );
  };

  getComboKitDependencies = async (req: Request, res: Response) => {
    const { id } = req.params;
    const dependencies = await this.comboService.getComboKitDependencies(
      id as string,
    );
    ResponseHandler.success(
      res,
      dependencies,
      "Combo kit dependencies fetched successfully",
    );
  };

  getComboKitAnalytics = async (req: Request, res: Response) => {
    const { id } = req.params;
    const analytics = await this.comboService.getComboKitAnalytics(
      id as string,
    );
    ResponseHandler.success(
      res,
      analytics,
      "Combo kit analytics fetched successfully",
    );
  };

  incrementComboKitView = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.incrementComboKitView(id as string);
    ResponseHandler.success(
      res,
      {},
      "Combo kit view count incremented successfully",
    );
  };

  incrementComboKitPurchase = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.incrementComboKitPurchase(
      id as string,
      req.body.quantity ?? 1,
    );
    ResponseHandler.success(
      res,
      {},
      "Combo kit purchased count incremented successfully",
    );
  };
}
