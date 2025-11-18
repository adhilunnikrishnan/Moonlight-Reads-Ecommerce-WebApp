import { Router } from "express";
import { homePage } from "../controllers/userController.js";

const userRoutes = Router({ mergeParams: true });

userRoutes.get("/", homePage)

export default userRoutes;
