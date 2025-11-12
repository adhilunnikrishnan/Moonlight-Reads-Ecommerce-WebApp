import {Router} from "express"
import { adminLoginPage, adminLogout } from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminAuth.js";

const adminRoutes = Router({mergeParams:true})

adminRoutes.get("/", adminLoginPage)

adminRoutes.post("/login", adminLogin);

adminRoutes.get("/logout", adminLogout);


export default adminRoutes;