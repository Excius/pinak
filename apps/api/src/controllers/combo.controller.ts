import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { ComboService } from "../services/combo.service.js";

export class ComboController {
  constructor(private comboService: ComboService) {}

  getComboKits = async (req: Request, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      isActive: req.query.isActive ? req.query.isActive === "true" : undefined,
    };

    const kits = await this.comboService.getComboKits(pagination);
    ResponseHandler.success(res, kits, "Combo kits fetched successfully");
  };

  getComboKitBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const kit = await this.comboService.getComboKitBySlug(slug as string);
    if (!kit) return ResponseHandler.notFound(res, "Combo kit not found");
    ResponseHandler.success(res, kit, "Combo kit fetched successfully");
  };

  // Admin / manager
  createComboKit = async (req: Request, res: Response) => {
    const data = req.body;
    const kit = await this.comboService.createComboKit(data);
    ResponseHandler.success(res, kit, "Combo kit created successfully");
  };

  updateComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const kit = await this.comboService.updateComboKit(id as string, data);
    ResponseHandler.success(res, kit, "Combo kit updated successfully");
  };

  addComboKitItem = async (req: Request, res: Response) => {
    const { comboKitId } = req.params;
    const data = req.body;
    const item = await this.comboService.addComboKitItem(comboKitId as string, data);
    ResponseHandler.success(res, item, "Combo kit item added successfully");
  };

  removeComboKitItem = async (req: Request, res: Response) => {
    const { comboKitId, itemId } = req.params;
    await this.comboService.removeComboKitItem(comboKitId as string, itemId as string);
    ResponseHandler.success(res, {}, "Combo kit item removed successfully");
  };

  softDeleteComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.softDeleteComboKit(id as string);
    ResponseHandler.success(res, {}, "Combo kit deleted successfully");
  };

  restoreComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.restoreComboKit(id as string);
    ResponseHandler.success(res, {}, "Combo kit restored successfully");
  };

  hardDeleteComboKit = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.comboService.hardDeleteComboKit(id as string);
    ResponseHandler.success(res, {}, "Combo kit permanently deleted successfully");
  };
}
