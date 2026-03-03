import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/checkRole";
import { addTask, assignTask, getTasks } from "../controllers/taskController";
const router=Router();


router.post('/',authenticate,adminOnly,addTask)
router.put('/:taskId/assign',authenticate,adminOnly,assignTask)
router.get('/',authenticate,getTasks)
export default router;
