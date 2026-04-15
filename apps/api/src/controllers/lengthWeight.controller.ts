import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import {
  LengthClassService,
  WeightClassService,
} from "../services/lengthWeight.service.js";
import {
  toAdminLengthClass,
  toAdminLengthClassList,
  toAdminWeightClass,
  toAdminWeightClassList,
  toPublicLengthClass,
  toPublicLengthClassList,
  toPublicWeightClass,
  toPublicWeightClassList,
} from "../lib/mappers/lengthWeight.mapper.js";

export class LengthClassController {
  constructor(private service: LengthClassService) {}

  listPublic = async (req: Request, res: Response) => {
    const items = await this.service.list();
    ResponseHandler.success(
      res,
      toPublicLengthClassList(items),
      "Length classes fetched",
    );
  };

  getPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Length class not found");
    ResponseHandler.success(res, toPublicLengthClass(item), "Length class fetched");
  };

  listAdmin = async (req: Request, res: Response) => {
    const items = await this.service.list();
    ResponseHandler.success(
      res,
      toAdminLengthClassList(items),
      "Length classes fetched",
    );
  };

  getAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Length class not found");
    ResponseHandler.success(res, toAdminLengthClass(item), "Length class fetched");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const item = await this.service.create(data);
    ResponseHandler.success(res, toAdminLengthClass(item), "Length class created");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const item = await this.service.update(id as string, data);
    ResponseHandler.success(res, toAdminLengthClass(item), "Length class updated");
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.delete(id as string);
    ResponseHandler.success(res, {}, "Length class deleted");
  };
}

export class WeightClassController {
  constructor(private service: WeightClassService) {}

  listPublic = async (req: Request, res: Response) => {
    const items = await this.service.list();
    ResponseHandler.success(
      res,
      toPublicWeightClassList(items),
      "Weight classes fetched",
    );
  };

  getPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Weight class not found");
    ResponseHandler.success(res, toPublicWeightClass(item), "Weight class fetched");
  };

  listAdmin = async (req: Request, res: Response) => {
    const items = await this.service.list();
    ResponseHandler.success(
      res,
      toAdminWeightClassList(items),
      "Weight classes fetched",
    );
  };

  getAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await this.service.getById(id as string);
    if (!item) return ResponseHandler.notFound(res, "Weight class not found");
    ResponseHandler.success(res, toAdminWeightClass(item), "Weight class fetched");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const item = await this.service.create(data);
    ResponseHandler.success(res, toAdminWeightClass(item), "Weight class created");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const item = await this.service.update(id as string, data);
    ResponseHandler.success(res, toAdminWeightClass(item), "Weight class updated");
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.delete(id as string);
    ResponseHandler.success(res, {}, "Weight class deleted");
  };
}
