import { Request, Response } from "express";
import { ValidationError } from "../lib/error.js";
import { ResponseHandler } from "../lib/response.js";
import { BrandService } from "../services/brand.service.js";
import {
  toAdminBrand,
  toAdminBrandList,
  toPublicBrand,
  toPublicBrandList,
} from "../lib/mappers/brand.mapper.js";

export class BrandController {
  constructor(private brandService: BrandService) {}

  private resolveActiveOnly = (activeOnlyQuery: unknown): boolean => {
    if (activeOnlyQuery === undefined) return false;

    const value = Array.isArray(activeOnlyQuery)
      ? activeOnlyQuery[0]
      : activeOnlyQuery;

    if (value === undefined) return false;
    if (typeof value === "boolean") return value;

    const normalizedValue = String(value).trim().toLowerCase();

    if (normalizedValue === "") return true;
    if (["true", "1", "yes", "on"].includes(normalizedValue)) return true;
    if (["false", "0", "no", "off"].includes(normalizedValue)) return false;

    throw new ValidationError("Validation failed", [
      {
        field: "activeOnly",
        message: "activeOnly must be true or false",
      },
    ]);
  };

  listPublic = async (req: Request, res: Response) => {
    const activeOnly = true;
    const brands = await this.brandService.listBrands(activeOnly);
    ResponseHandler.success(
      res,
      toPublicBrandList(brands),
      "Brands fetched successfully",
    );
  };

  getByIdPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const brand = await this.brandService.getBrandById(id as string, true);
    if (!brand) return ResponseHandler.notFound(res, "Brand not found");
    ResponseHandler.success(
      res,
      toPublicBrand(brand),
      "Brand fetched successfully",
    );
  };

  getBySlugPublic = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const brand = await this.brandService.getBrandBySlug(slug as string, true);
    if (!brand) return ResponseHandler.notFound(res, "Brand not found");
    ResponseHandler.success(
      res,
      toPublicBrand(brand),
      "Brand fetched successfully",
    );
  };

  listAdmin = async (req: Request, res: Response) => {
    const activeOnly = this.resolveActiveOnly(req.query.activeOnly);
    const brands = await this.brandService.listBrands(activeOnly);
    ResponseHandler.success(
      res,
      toAdminBrandList(brands),
      "Brands fetched successfully",
    );
  };

  getByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const brand = await this.brandService.getBrandById(id as string);
    if (!brand) return ResponseHandler.notFound(res, "Brand not found");
    ResponseHandler.success(res, toAdminBrand(brand), "Brand fetched successfully");
  };

  getBySlugAdmin = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const brand = await this.brandService.getBrandBySlug(slug as string);
    if (!brand) return ResponseHandler.notFound(res, "Brand not found");
    ResponseHandler.success(res, toAdminBrand(brand), "Brand fetched successfully");
  };

  create = async (req: Request, res: Response) => {
    const data = req.body;
    const brand = await this.brandService.createBrand(data);
    ResponseHandler.success(
      res,
      toAdminBrand(brand),
      "Brand created successfully",
    );
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const brand = await this.brandService.updateBrand(id as string, data);
    ResponseHandler.success(
      res,
      toAdminBrand(brand),
      "Brand updated successfully",
    );
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.brandService.deleteBrand(id as string);
    ResponseHandler.success(res, {}, "Brand deleted successfully");
  };
}
