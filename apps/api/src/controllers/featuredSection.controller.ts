import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { FeaturedSectionService } from "../services/featuredSection.service.js";
import {
  toAdminFeaturedSection,
  toAdminFeaturedSectionList,
  toPublicFeaturedSection,
  toPublicFeaturedSectionList,
} from "../lib/mappers/featuredSection.mapper.js";
import type { FeaturedType } from "../generated/prisma/enums.js";

export class FeaturedSectionController {
  constructor(private service: FeaturedSectionService) {}

  listPublic = async (_req: Request, res: Response) => {
    const sections = await this.service.listFeaturedSections();
    ResponseHandler.success(
      res,
      toPublicFeaturedSectionList(sections),
      "Featured sections fetched successfully",
    );
  };

  getByIdPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const section = await this.service.getFeaturedSectionById(id as string);
    ResponseHandler.success(
      res,
      toPublicFeaturedSection(section),
      "Featured section fetched successfully",
    );
  };

  listAdmin = async (_req: Request, res: Response) => {
    const sections = await this.service.listFeaturedSections();
    ResponseHandler.success(
      res,
      toAdminFeaturedSectionList(sections),
      "Featured sections fetched successfully",
    );
  };

  getByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const section = await this.service.getFeaturedSectionById(id as string);
    ResponseHandler.success(
      res,
      toAdminFeaturedSection(section),
      "Featured section fetched successfully",
    );
  };

  create = async (req: Request, res: Response) => {
    const { title, type, priority } = req.body as {
      title: string;
      type: FeaturedType;
      priority?: number;
    };
    const section = await this.service.createFeaturedSection({
      title,
      type,
      priority,
    });
    ResponseHandler.created(
      res,
      toAdminFeaturedSection(section),
      "Featured section created successfully",
    );
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, type, priority } = req.body as {
      title?: string;
      type?: FeaturedType;
      priority?: number;
    };
    const section = await this.service.updateFeaturedSection(id as string, {
      title,
      type,
      priority,
    });
    ResponseHandler.success(
      res,
      toAdminFeaturedSection(section),
      "Featured section updated successfully",
    );
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteFeaturedSection(id as string);
    ResponseHandler.success(res, {}, "Featured section deleted successfully");
  };
}
