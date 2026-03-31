import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { OptionService } from "../services/option.service.js";

export class OptionController {
  constructor(private optionService: OptionService) {}

  list = async (req: Request, res: Response) => {
    const options = await this.optionService.listOptions();
    ResponseHandler.success(res, options, "Options fetched successfully");
  };

  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const option = await this.optionService.getOptionById(id as string);
    if (!option) return ResponseHandler.notFound(res, "Option not found");
    ResponseHandler.success(res, option, "Option fetched successfully");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const option = await this.optionService.createOption(data);
    ResponseHandler.success(res, option, "Option created successfully");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const option = await this.optionService.updateOption(id as string, data);
    ResponseHandler.success(res, option, "Option updated successfully");
  };

  remove = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.optionService.deleteOption(id as string);
    ResponseHandler.success(res, {}, "Option deleted successfully");
  };

  createValue = async (req: Request, res: Response) => {
    const { optionId } = req.params;
    const { value } = req.body;
    const v = await this.optionService.createOptionValue(
      optionId as string,
      value,
    );
    ResponseHandler.success(res, v, "Option value created successfully");
  };

  updateValue = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const v = await this.optionService.updateOptionValue(id as string, data);
    ResponseHandler.success(res, v, "Option value updated successfully");
  };

  deleteValue = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.optionService.deleteOptionValue(id as string);
    ResponseHandler.success(res, {}, "Option value deleted successfully");
  };
}
