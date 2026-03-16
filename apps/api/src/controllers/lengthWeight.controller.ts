import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import {
  LengthClassService,
  WeightClassService,
} from "../services/lengthWeight.service.js";

export class LengthClassController {
  constructor(private service: LengthClassService) {}

  list = async (req: Request, res: Response) => {
    const items = await this.service.list();
    ResponseHandler.success(res, items, "Length classes fetched");
  };

  get = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Length class not found");
    ResponseHandler.success(res, item, "Length class fetched");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const item = await this.service.create(data);
    ResponseHandler.success(res, item, "Length class created");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const item = await this.service.update(id as string, data);
    ResponseHandler.success(res, item, "Length class updated");
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.delete(id as string);
    ResponseHandler.success(res, {}, "Length class deleted");
  };
}

export class WeightClassController {
  constructor(private service: WeightClassService) {}

  list = async (req: Request, res: Response) => {
    const items = await this.service.list();
    ResponseHandler.success(res, items, "Weight classes fetched");
  };

  get = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Weight class not found");
    ResponseHandler.success(res, item, "Weight class fetched");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const item = await this.service.create(data);
    ResponseHandler.success(res, item, "Weight class created");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const item = await this.service.update(id as string, data);
    ResponseHandler.success(res, item, "Weight class updated");
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.delete(id as string);
    ResponseHandler.success(res, {}, "Weight class deleted");
  };
}
