import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { AddressService } from "../services/address.service.js";

export class AddressController {
  constructor(private addressService: AddressService) {}

  createAddress = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const address = await this.addressService.createAddress(userId, req.body);
    ResponseHandler.created(res, address, "Address created successfully");
  };

  updateAddress = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const address = await this.addressService.updateAddress(id as string, userId, req.body);
    ResponseHandler.success(res, address, "Address updated successfully");
  };

  deleteAddress = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    await this.addressService.deleteAddress(id as string, userId);
    ResponseHandler.success(res, {}, "Address deleted successfully");
  };

  getAddressById = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const address = await this.addressService.getAddressById(id as string, userId);
    ResponseHandler.success(res, address, "Address fetched successfully");
  };

  listAddresses = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const addresses = await this.addressService.listAddresses(userId);
    ResponseHandler.success(res, addresses, "Addresses fetched successfully");
  };

  setDefaultAddress = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const address = await this.addressService.setDefaultAddress(id as string, userId);
    ResponseHandler.success(res, address, "Default address updated successfully");
  };
}
