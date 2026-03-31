import { Router } from "express";
import authRoutes from "./auth.route.js";
import productRoutes from "./product.route.js";
import comboRoutes from "./combo.route.js";
import brandRoutes from "./brand.route.js";
import optionRoutes from "./option.route.js";
import filterRoutes from "./filter.route.js";
import taxClassRoutes from "./taxClass.route.js";
import lengthWeightRoutes from "./lengthWeight.route.js";
import productCategoryRoutes from "./productCategory.route.js";
import relatedProductRoutes from "./relatedProduct.route.js";
import categoryRoutes from "./category.route.js";
import featuredSectionRoutes from "./featuredSection.route.js";
import wishlistRoutes from "./wishlist.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/combo-kits", comboRoutes);
router.use("/brands", brandRoutes);
router.use("/options", optionRoutes);
router.use("/filters", filterRoutes);
router.use("/tax-classes", taxClassRoutes);
router.use(lengthWeightRoutes); // exposes /length-classes and /weight-classes at root
router.use("/products", productCategoryRoutes); // /products/:productId/categories
router.use("/products", relatedProductRoutes); // /products/:productId/related
router.use("/categories", categoryRoutes);
router.use("/featured-sections", featuredSectionRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;
