import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { RelatedProductService } from "../services/relatedProduct.service.js";

export class RelatedProductController {
  constructor(private service: RelatedProductService) {}

  add = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { relatedProductId, sortOrder } = req.body;
    const rel = await this.service.addRelatedProduct(
      productId as string,
      relatedProductId as string,
      sortOrder ?? 0,
    );
    ResponseHandler.success(res, rel, "Related product added");
  };

  remove = async (req: Request, res: Response) => {
    const { productId, relatedProductId } = req.params;
    await this.service.removeRelatedProduct(
      productId as string,
      relatedProductId as string,
    );
    ResponseHandler.success(res, {}, "Related product removed");
  };

  list = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const list = await this.service.listRelated(productId as string);
    ResponseHandler.success(res, list, "Related products fetched");
  };
}
