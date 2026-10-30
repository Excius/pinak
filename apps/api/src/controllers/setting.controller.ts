import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { SettingService } from "../services/setting.service.js";
import { toSettingItem } from "../lib/mappers/setting.mapper.js";

export class SettingController {
  constructor(private service: SettingService) {}

  getPublicSettings = async (req: Request, res: Response) => {
    const group = req.query.group ? String(req.query.group) : undefined;
    const settings = await this.service.getPublicSettings(group);
    ResponseHandler.success(res, settings, "Settings fetched successfully");
  };

  getWhatsAppContact = async (_req: Request, res: Response) => {
    const contact = await this.service.getWhatsAppContact();
    ResponseHandler.success(
      res,
      contact,
      "WhatsApp contact fetched successfully",
    );
  };

  getByKey = async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await this.service.getByKey(key as string);
    ResponseHandler.success(res, setting, "Setting fetched successfully");
  };

  listAdmin = async (req: Request, res: Response) => {
    const group = req.query.group ? String(req.query.group) : undefined;
    const items = await this.service.listAdmin(group);
    ResponseHandler.success(
      res,
      items.map(toSettingItem),
      "Admin settings fetched successfully",
    );
  };

  updateSettings = async (req: Request, res: Response) => {
    const updated = await this.service.updateSettings(req.body);
    ResponseHandler.success(res, updated, "Settings updated successfully");
  };

  setSetting = async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await this.service.setSetting(key as string, req.body);
    ResponseHandler.success(
      res,
      toSettingItem(setting),
      "Setting saved successfully",
    );
  };
}
