import { Router } from "express";
import {
  addProductPage,
  adminDashboardPage,
  adminLoginPage,
  adminLogout,
} from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminAuth.js";

const adminRoutes = Router({ mergeParams: true });

adminRoutes.get("/", adminLoginPage);

adminRoutes.post("/login", adminLogin);

adminRoutes.get("/logout", adminLogout);

adminRoutes.get("/dashboard", adminDashboardPage);

adminRoutes.get("/add-product", addProductPage);

export default adminRoutes;
