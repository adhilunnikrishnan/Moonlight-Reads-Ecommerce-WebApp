import { Router } from "express";
import {
  addBook,
  addBookPage,
  adminDashboardPage,
  adminLoginPage,
  adminLogout,
  adminOrderDetailsPage,
  adminOrdersListPage,
  // adminOrdersListPage,
  blockUnblockUser,
  bookListPage,
  updateOrderStatus,
  usersListPage,
} from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminAuth.js";
import { uploadFiles } from "../middleware/uploadMiddelware.js";
import {
  deleteBook,
  editBookDetails,
  editBookDetailsPage,
} from "../controllers/booksController.js";

const adminRoutes = Router({ mergeParams: true });

adminRoutes.get("/", adminLoginPage);

adminRoutes.post("/login", adminLogin);

adminRoutes.get("/logout", adminLogout);

adminRoutes.get("/dashboard", adminDashboardPage);

adminRoutes.get("/add-book", addBookPage);

adminRoutes.get("/users-list", usersListPage)

adminRoutes.post(
  "/books/add",
  uploadFiles("userAssets/uploads", "multiple", "bookImage", 3),
  addBook
);

adminRoutes.get("/books/list", bookListPage);

adminRoutes.get(
  "/books/edit/:id",
  editBookDetailsPage
);

adminRoutes.post("/books/edit/:id", editBookDetails);

adminRoutes.post("/books/:id/delete", deleteBook)

adminRoutes.post("/block-user/:id", blockUnblockUser);

adminRoutes.get("/orders-list",adminOrdersListPage);

adminRoutes.get("/update-order-status/:id/:status", updateOrderStatus);


adminRoutes.get("/orders/:id", adminOrderDetailsPage);


export default adminRoutes;
