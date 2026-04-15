import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { OptionService } from "../services/option.service.js";
import {
  toAdminOption,
  toAdminOptionList,
  toAdminOptionValue,
  toPublicOption,
  toPublicOptionList,
} from "../lib/mappers/option.mapper.js";

export class OptionController {
  constructor(private optionService: OptionService) {}

  listPublic = async (_req: Request, res: Response) => {
    const options = await this.optionService.listOptions();
    ResponseHandler.success(
      res,
      toPublicOptionList(options),
      "Options fetched successfully",
    );
  };

  getByIdPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const option = await this.optionService.getOptionById(id as string);
    if (!option) return ResponseHandler.notFound(res, "Option not found");
    ResponseHandler.success(
      res,
      toPublicOption(option),
      "Option fetched successfully",
    );
  };

  listAdmin = async (_req: Request, res: Response) => {
    const options = await this.optionService.listOptions();
    ResponseHandler.success(
      res,
      toAdminOptionList(options),
      "Options fetched successfully",
    );
  };

  getByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const option = await this.optionService.getOptionById(id as string);
    if (!option) return ResponseHandler.notFound(res, "Option not found");
    ResponseHandler.success(res, toAdminOption(option), "Option fetched successfully");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const option = await this.optionService.createOption(data);
    ResponseHandler.success(
      res,
      toAdminOption(option),
      "Option created successfully",
    );
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const option = await this.optionService.updateOption(id as string, data);
    ResponseHandler.success(
      res,
      toAdminOption(option),
      "Option updated successfully",
    );
  };

  remove = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.optionService.deleteOption(id as string);
    ResponseHandler.success(res, {}, "Option deleted successfully");
  };

  createValue = async (req: Request, res: Response) => {
    const { optionId } = req.params;
    const data = req.body as { value: string; sortOrder?: number };
    const v = await this.optionService.createOptionValue(
      optionId as string,
      data,
    );
    ResponseHandler.success(
      res,
      toAdminOptionValue(v),
      "Option value created successfully",
    );
  };

  updateValue = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const v = await this.optionService.updateOptionValue(id as string, data);
    ResponseHandler.success(
      res,
      toAdminOptionValue(v),
      "Option value updated successfully",
    );
  };

  deleteValue = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.optionService.deleteOptionValue(id as string);
    ResponseHandler.success(res, {}, "Option value deleted successfully");
  };
}
