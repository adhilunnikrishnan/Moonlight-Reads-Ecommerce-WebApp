import { Router } from "express";
import {
  addToCart,
  addToWishlist,
  booksPage,
  cartPage,
  checkoutPage,
  clearCart,
  createAddress,
  getAccount,
  getOrderHistory,
  getWishlistPage,
  homePage,
  loginPage,
  orderSuccess,
  placeOrder,
  removeFromCart,
  signupPage,
  updateAccount,
} from "../controllers/userController.js";
import { createUser, loginUser } from "../controllers/userAuth.js";
import { redirectIfLoggedIn } from "../middleware/redirectIfLoggedIn.js";
import { noCache } from "../middleware/noCache.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { bookViewPage } from "../controllers/booksController.js";

const userRoutes = Router({ mergeParams: true });

userRoutes.get("/", homePage);

userRoutes.get("/login", noCache, redirectIfLoggedIn, loginPage);

userRoutes.get("/signup", noCache, redirectIfLoggedIn, signupPage);

userRoutes.post("/login-user", loginUser);

userRoutes.post("/create-user", createUser);

userRoutes.get("/books", booksPage);

userRoutes.get("/bookview", bookViewPage);


userRoutes.get("/cart", requireAuth, cartPage);

userRoutes.post("/add-to-cart", requireAuth, addToCart);

userRoutes.get("/cart/clear", clearCart); //clear cart

userRoutes.get("/cart/remove/:booksId", removeFromCart); //remove selected product from cart

userRoutes.get("/checkout", checkoutPage);

userRoutes.post("/create-address", createAddress);

userRoutes.post("/place-order", placeOrder);


userRoutes.get("/order-success", orderSuccess);

userRoutes.get("/order-history", requireAuth, getOrderHistory);

userRoutes.get("/account-details", requireAuth, getAccount);

userRoutes.post("/account-details", requireAuth, updateAccount)

//whishlist
// GET wishlist page

userRoutes.get("/wishlist", requireAuth, getWishlistPage);

userRoutes.post("/add-to-wishlist", requireAuth, addToWishlist);

// userRoutes.post("/remove-from-wishlist", requireAuth, removeFromWishlist);


export default userRoutes;
