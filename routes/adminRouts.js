import { Router } from "express";
import {
  addBook,
  addBookPage,
  adminDashboardPage,
  adminLoginPage,
  adminLogout,
  bookListPage,
} from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminAuth.js";

const adminRoutes = Router({ mergeParams: true });

adminRoutes.get("/", adminLoginPage);

adminRoutes.post("/login", adminLogin);

adminRoutes.get("/logout", adminLogout);

adminRoutes.get("/dashboard", adminDashboardPage);

adminRoutes.get("/add-book", addBookPage);

adminRoutes.post("/books/add", addBook);

adminRoutes.get("/books/list", bookListPage);

export default adminRoutes;
