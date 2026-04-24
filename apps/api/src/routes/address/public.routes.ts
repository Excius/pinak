import { Router } from "express";
import { AddressTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import { AddressRouteDeps } from "./index.js";

export const registerAddressPublicRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: AddressRouteDeps,
) => {
  router.use(authMiddleware.authenticate);
  router.use(rateLimiter);

  router.post("/", validateMultiple(AddressTypes.CreateAddress), controller.createAddress);
  router.get("/", validateMultiple(AddressTypes.ListAddresses), controller.listAddresses);
  router.get("/:id", validateMultiple(AddressTypes.GetAddressById), controller.getAddressById);
  router.patch("/:id", validateMultiple(AddressTypes.UpdateAddress), controller.updateAddress);
  router.delete("/:id", validateMultiple(AddressTypes.DeleteAddress), controller.deleteAddress);
  router.patch("/:id/default", validateMultiple(AddressTypes.SetDefaultAddress), controller.setDefaultAddress);
};
