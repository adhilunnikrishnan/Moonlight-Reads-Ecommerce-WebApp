import { Router } from "express";
import {
  addToCart,
  booksPage,
  cartPage,
  homePage,
  loginPage,
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

userRoutes.get("/book/view", bookViewPage);


userRoutes.get("/cart", requireAuth, cartPage); //requireAuth

userRoutes.post("/add-to-cart", requireAuth, addToCart);



export default userRoutes;
