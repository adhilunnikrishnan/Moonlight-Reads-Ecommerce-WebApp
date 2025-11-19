import { Router } from "express";
import { homePage } from "../controllers/userController.js";
import { createUser } from "../controllers/userAuth.js";

const userRoutes = Router({ mergeParams: true });

userRoutes.get("/", homePage);

userRoutes.post("/signup", createUser);

export default userRoutes;
