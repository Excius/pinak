import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { BrandService } from "../services/brand.service.js";

export class BrandController {
  constructor(private brandService: BrandService) {}

  list = async (req: Request, res: Response) => {
    const activeOnly = req.query.activeOnly
      ? req.query.activeOnly === "true"
      : false;
    const brands = await this.brandService.listBrands(activeOnly);
    ResponseHandler.success(res, brands, "Brands fetched successfully");
  };

  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const brand = await this.brandService.getBrandById(id as string);
    if (!brand) return ResponseHandler.notFound(res, "Brand not found");
    ResponseHandler.success(res, brand, "Brand fetched successfully");
  };

  getBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const brand = await this.brandService.getBrandBySlug(slug as string);
    if (!brand) return ResponseHandler.notFound(res, "Brand not found");
    ResponseHandler.success(res, brand, "Brand fetched successfully");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const brand = await this.brandService.createBrand(data);
    ResponseHandler.success(res, brand, "Brand created successfully");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const brand = await this.brandService.updateBrand(id as string, data);
    ResponseHandler.success(res, brand, "Brand updated successfully");
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.brandService.deleteBrand(id as string);
    ResponseHandler.success(res, {}, "Brand deleted successfully");
  };
}
