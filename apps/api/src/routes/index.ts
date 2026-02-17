import { Router } from "express";
import authRoutes from "./auth.route.js";
import productRoutes from "./product.route.js";
import comboRoutes from "./combo.route.js";

const router = Router();


router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/combo-kits", comboRoutes);

export default router;
