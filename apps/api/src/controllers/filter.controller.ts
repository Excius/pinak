import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { FilterService } from "../services/filter.service.js";

export class FilterController {
  constructor(private filterService: FilterService) {}

  listGroups = async (req: Request, res: Response) => {
    const activeOnly = req.query.activeOnly
      ? req.query.activeOnly === "true"
      : false;
    const groups = await this.filterService.listGroups(activeOnly);
    ResponseHandler.success(res, groups, "Filter groups fetched successfully");
  };

  getGroup = async (req: Request, res: Response) => {
    const { id } = req.params;
    const group = await this.filterService.getGroupById(id as string);
    if (!group) return ResponseHandler.notFound(res, "Filter group not found");
    ResponseHandler.success(res, group, "Filter group fetched successfully");
  };

  createGroup = async (req: Request, res: Response) => {
    const data = req.body;
    const g = await this.filterService.createGroup(data);
    ResponseHandler.success(res, g, "Filter group created successfully");
  };

  updateGroup = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const g = await this.filterService.updateGroup(id as string, data);
    ResponseHandler.success(res, g, "Filter group updated successfully");
  };

  deleteGroup = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.filterService.deleteGroup(id as string);
    ResponseHandler.success(res, {}, "Filter group deleted successfully");
  };

  createValue = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const data = req.body;
    const v = await this.filterService.createValue(groupId as string, data);
    ResponseHandler.success(res, v, "Filter value created successfully");
  };

  updateValue = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const v = await this.filterService.updateValue(id as string, data);
    ResponseHandler.success(res, v, "Filter value updated successfully");
  };

  deleteValue = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.filterService.deleteValue(id as string);
    ResponseHandler.success(res, {}, "Filter value deleted successfully");
  };

  addFilterToProduct = async (req: Request, res: Response) => {
    const { productId, filterValueId } = req.params;
    const rel = await this.filterService.addFilterToProduct(
      productId as string,
      filterValueId as string,
    );
    ResponseHandler.success(res, rel, "Filter value attached to product");
  };

  removeFilterFromProduct = async (req: Request, res: Response) => {
    const { productId, filterValueId } = req.params;
    await this.filterService.removeFilterFromProduct(
      productId as string,
      filterValueId as string,
    );
    ResponseHandler.success(res, {}, "Filter value removed from product");
  };
}
