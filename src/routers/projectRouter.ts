import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/checkRole";
import { addProject, getProjects } from "../controllers/projectController";
const router=Router();


router.post('/',authenticate,adminOnly,addProject)
router.get('/',authenticate,getProjects)


export default router;