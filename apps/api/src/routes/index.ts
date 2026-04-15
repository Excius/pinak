import { Router } from "express";
import authRoutes from "./auth.route.js";
import productRoutes from "./product/index.js";
import comboRoutes from "./combo/index.js";
import brandRoutes from "./brand/index.js";
import optionRoutes from "./option/index.js";
import filterRoutes from "./filter/index.js";
import taxClassRoutes from "./taxClass/index.js";
import classRoutes from "./classes/index.js";
import categoryRoutes from "./category/category.route.js";
import featuredSectionRoutes from "./featuredSection/index.js";
import wishlistRoutes from "./wishlist/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/combo-kits", comboRoutes);
router.use("/brands", brandRoutes);
router.use("/options", optionRoutes);
router.use("/filters", filterRoutes);
router.use("/tax-classes", taxClassRoutes);
router.use(classRoutes); // exposes /length-classes and /weight-classes at root
router.use("/categories", categoryRoutes);
router.use("/featured-sections", featuredSectionRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;
