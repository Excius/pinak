import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { DynamicAssetService } from "../services/dynamicAsset.service.js";

export class DynamicAssetController {
  constructor(private service: DynamicAssetService) {}

  // ── Public routes ──────────────────────────────────────────────────────────

  listPublic = async (_req: Request, res: Response) => {
    const assets = await this.service.listActive();
    ResponseHandler.success(res, assets, "Dynamic assets fetched successfully");
  };

  getBySlugPublic = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const asset = await this.service.getBySlug(slug as string);
    ResponseHandler.success(res, asset, "Dynamic asset fetched successfully");
  };

  // ── Admin routes ───────────────────────────────────────────────────────────

  listAdmin = async (req: Request, res: Response) => {
    const includeDeleted = req.query.includeDeleted === "true";
    const assets = await this.service.listAll(includeDeleted);
    ResponseHandler.success(res, assets, "Dynamic assets fetched successfully");
  };

  getByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const asset = await this.service.getById(id as string, true);
    ResponseHandler.success(res, asset, "Dynamic asset fetched successfully");
  };

  create = async (req: Request, res: Response) => {
    const { slug, type, title, description, metadata } = req.body;
    const file = req.file;
    if (!file) {
      return ResponseHandler.badRequest(res, "File is required");
    }

    // Parse metadata if it's a stringified JSON (multipart form sends strings)
    let parsedMetadata = metadata;
    if (typeof metadata === "string") {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    const asset = await this.service.create(
      {
        slug,
        type,
        title,
        description,
        metadata: parsedMetadata,
      },
      file.buffer,
      file.mimetype,
    );
    ResponseHandler.created(res, asset, "Dynamic asset created successfully");
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { slug, title, description, type, isActive, metadata } = req.body;

    // Parse metadata if it's a stringified JSON
    let parsedMetadata = metadata;
    if (typeof metadata === "string") {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    const asset = await this.service.update(id as string, {
      slug,
      title,
      description,
      type,
      isActive,
      metadata: parsedMetadata,
    });
    ResponseHandler.success(res, asset, "Dynamic asset updated successfully");
  };

  replaceFile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      return ResponseHandler.badRequest(res, "File is required");
    }

    const asset = await this.service.replaceFile(
      id as string,
      file.buffer,
      file.mimetype,
    );
    ResponseHandler.success(
      res,
      asset,
      "Dynamic asset file replaced successfully",
    );
  };

  softDelete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.softDelete(id as string);
    ResponseHandler.success(
      res,
      {},
      "Dynamic asset soft deleted successfully",
    );
  };

  restore = async (req: Request, res: Response) => {
    const { id } = req.params;
    const asset = await this.service.restore(id as string);
    ResponseHandler.success(res, asset, "Dynamic asset restored successfully");
  };

  hardDelete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.hardDelete(id as string);
    ResponseHandler.success(
      res,
      {},
      "Dynamic asset permanently deleted successfully",
    );
  };
}
