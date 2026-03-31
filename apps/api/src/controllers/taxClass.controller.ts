import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { TaxClassService } from "../services/taxClass.service.js";

export class TaxClassController {
  constructor(private service: TaxClassService) {}

  list = async (req: Request, res: Response) => {
    const items = await this.service.listTaxClasses();
    ResponseHandler.success(res, items, "Tax classes fetched");
  };

  get = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getTaxClassById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Tax class not found");
    ResponseHandler.success(res, item, "Tax class fetched");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const item = await this.service.createTaxClass(data);
    ResponseHandler.success(res, item, "Tax class created");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const item = await this.service.updateTaxClass(id as string, data);
    ResponseHandler.success(res, item, "Tax class updated");
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteTaxClass(id as string);
    ResponseHandler.success(res, {}, "Tax class deleted");
  };
}
