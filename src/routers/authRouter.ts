import { Router } from "express";
import { loginController, registerCompanyController, registerController } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";

const router=Router();

router.post('/register-company',registerCompanyController)
router.post('/adminLogin',loginController)
router.post('/register',authenticate,registerController)

export default router;