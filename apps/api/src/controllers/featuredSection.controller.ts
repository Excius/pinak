import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { FeaturedSectionService } from "../services/featuredSection.service.js";

export class FeaturedSectionController {
  constructor(private service: FeaturedSectionService) {}

  list = async (_req: Request, res: Response) => {
    const sections = await this.service.listFeaturedSections();
    ResponseHandler.success(
      res,
      sections,
      "Featured sections fetched successfully",
    );
  };

  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const section = await this.service.getFeaturedSectionById(id as string);
    ResponseHandler.success(
      res,
      section,
      "Featured section fetched successfully",
    );
  };

  create = async (req: Request, res: Response) => {
    const { title, type, priority } = req.body as {
      title: string;
      type: "EXPERT_PICKS" | "HOMEPAGE_HERO" | "DEALS";
      priority?: number;
    };
    const section = await this.service.createFeaturedSection({
      title,
      type,
      priority,
    });
    ResponseHandler.created(
      res,
      section,
      "Featured section created successfully",
    );
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, type, priority } = req.body as {
      title?: string;
      type?: "EXPERT_PICKS" | "HOMEPAGE_HERO" | "DEALS";
      priority?: number;
    };
    const section = await this.service.updateFeaturedSection(id as string, {
      title,
      type,
      priority,
    });
    ResponseHandler.success(
      res,
      section,
      "Featured section updated successfully",
    );
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteFeaturedSection(id as string);
    ResponseHandler.success(res, {}, "Featured section deleted successfully");
  };
}
