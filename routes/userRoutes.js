import { Router } from "express";
import {
  addToCart,
  booksPage,
  cartPage,
  checkoutPage,
  createAddress,
  homePage,
  loginPage,
  orderSuccess,
  placeOrder,
  signupPage,
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

// userRoutes.get("/cart/remove/:productId", removeFromCart); //remove selected product from cart

userRoutes.get("/checkout", checkoutPage);

userRoutes.post("/create-address", createAddress);

userRoutes.post("/place-order", placeOrder);


userRoutes.get("/order-success", orderSuccess);




export default userRoutes;
