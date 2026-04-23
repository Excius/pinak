import { AddressRepository } from "../repositories/address.repository.js";
import { NotFoundError, ValidationError } from "../lib/error.js";
import { Prisma } from "../generated/prisma/client.js";

export class AddressService {
  constructor(private addressRepository: AddressRepository) {}

  async createAddress(userId: string, data: any) {
    return this.addressRepository.create(userId, data);
  }

  async updateAddress(id: string, userId: string, data: any) {
    const existing = await this.addressRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }
    return this.addressRepository.update(id, userId, data);
  }

  async deleteAddress(id: string, userId: string) {
    const existing = await this.addressRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }
    return this.addressRepository.delete(id, userId);
  }

  async getAddressById(id: string, userId: string) {
    const address = await this.addressRepository.findById(id, userId);
    if (!address) {
      throw new NotFoundError("Address not found");
    }
    return address;
  }

  async listAddresses(userId: string) {
    return this.addressRepository.listByUser(userId);
  }

  async setDefaultAddress(id: string, userId: string) {
    const existing = await this.addressRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }
    return this.addressRepository.setDefault(id, userId);
  }
}
