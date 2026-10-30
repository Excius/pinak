import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { StoreService } from "../services/store.service.js";
import {
  toPublicStore,
  toPublicStoreList,
  toAdminStore,
  toAdminStoreList,
} from "../lib/mappers/store.mapper.js";

export class StoreController {
  constructor(private service: StoreService) {}

  listPublic = async (req: Request, res: Response) => {
    const query = req.query as Record<string, any>;
    const result = await this.service.listPublicStores({
      search: query.search ? String(query.search) : undefined,
      city: query.city ? String(query.city) : undefined,
      state: query.state ? String(query.state) : undefined,
      zipCode: query.zipCode ? String(query.zipCode) : undefined,
      latitude: query.latitude !== undefined && query.latitude !== "" ? Number(query.latitude) : undefined,
      longitude: query.longitude !== undefined && query.longitude !== "" ? Number(query.longitude) : undefined,
      radius: query.radius !== undefined && query.radius !== "" ? Number(query.radius) : undefined,
      page: query.page !== undefined ? Number(query.page) : undefined,
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
      sortBy: query.sortBy ? (String(query.sortBy) as any) : undefined,
      sortOrder: query.sortOrder ? (String(query.sortOrder) as any) : undefined,
    });

    ResponseHandler.success(
      res,
      toPublicStoreList(result.stores, result.pagination),
      "Stores fetched successfully",
    );
  };

  getByIdPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await this.service.getPublicStoreById(id as string);
    ResponseHandler.success(
      res,
      toPublicStore(store),
      "Store fetched successfully",
    );
  };

  getLocationsPublic = async (_req: Request, res: Response) => {
    const locations = await this.service.getStoreLocations();
    ResponseHandler.success(
      res,
      locations,
      "Store locations fetched successfully",
    );
  };

  listAdmin = async (req: Request, res: Response) => {
    const query = req.query as Record<string, any>;
    const result = await this.service.listAdminStores({
      search: query.search ? String(query.search) : undefined,
      city: query.city ? String(query.city) : undefined,
      state: query.state ? String(query.state) : undefined,
      zipCode: query.zipCode ? String(query.zipCode) : undefined,
      isActive: query.isActive !== undefined ? query.isActive === "true" || query.isActive === true : undefined,
      includeDeleted:
        query.includeDeleted !== undefined
          ? query.includeDeleted === "true" || query.includeDeleted === true
          : undefined,
      page: query.page !== undefined ? Number(query.page) : undefined,
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
      sortBy: query.sortBy ? (String(query.sortBy) as any) : undefined,
      sortOrder: query.sortOrder ? (String(query.sortOrder) as any) : undefined,
    });

    ResponseHandler.success(
      res,
      toAdminStoreList(result.stores, result.pagination),
      "Admin stores fetched successfully",
    );
  };

  getByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await this.service.getAdminStoreById(id as string);
    ResponseHandler.success(
      res,
      toAdminStore(store),
      "Store fetched successfully",
    );
  };

  create = async (req: Request, res: Response) => {
    const store = await this.service.createStore(req.body);
    ResponseHandler.created(
      res,
      toAdminStore(store),
      "Store created successfully",
    );
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await this.service.updateStore(id as string, req.body);
    ResponseHandler.success(
      res,
      toAdminStore(store),
      "Store updated successfully",
    );
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteStore(id as string);
    ResponseHandler.success(res, {}, "Store deleted successfully");
  };

  restore = async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await this.service.restoreStore(id as string);
    ResponseHandler.success(
      res,
      toAdminStore(store),
      "Store restored successfully",
    );
  };
}
