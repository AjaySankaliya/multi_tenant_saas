import { Router } from "express";
import { adminLoginController, loginController, registerCompanyController, registerController } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/checkRole";

const router=Router();

router.post('/register-company',registerCompanyController)
router.post('/adminLogin',adminLoginController)
router.post('/register',authenticate,adminOnly,registerController)
router.post('/login',loginController)

export default router;