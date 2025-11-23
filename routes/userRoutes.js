import { Router } from "express";
import { homePage, loginPage, signupPage } from "../controllers/userController.js";
import { createUser, loginUser} from "../controllers/userAuth.js";
import { redirectIfLoggedIn } from "../middleware/redirectIfLoggedIn.js";
import { noCache } from "../middleware/noCache.js";

const userRoutes = Router({ mergeParams: true });

userRoutes.get("/", homePage);


userRoutes.get("/login", noCache, redirectIfLoggedIn, loginPage);

userRoutes.get("/signup", noCache, redirectIfLoggedIn, signupPage);

userRoutes.post("/login-user", loginUser)

userRoutes.post("/create-user", createUser);



export default userRoutes;
