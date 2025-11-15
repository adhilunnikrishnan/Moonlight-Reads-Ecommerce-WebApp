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
import { uploadFiles } from "../middleware/uploadMiddelware.js";
import { editBookDetails, editBookDetailsPage } from "../controllers/booksController.js";

const adminRoutes = Router({ mergeParams: true });

adminRoutes.get("/", adminLoginPage);

adminRoutes.post("/login", adminLogin);

adminRoutes.get("/logout", adminLogout);

adminRoutes.get("/dashboard", adminDashboardPage);

adminRoutes.get("/add-book", addBookPage);

adminRoutes.post("/books/add",
  uploadFiles("userAssets/uploads", "multiple", "bookImage", 3),
  addBook);

adminRoutes.get("/books/list", bookListPage);

adminRoutes.get("/books/edit/:id", editBookDetailsPage)

adminRoutes.post("/books/:id/edit", editBookDetails)

export default adminRoutes;
