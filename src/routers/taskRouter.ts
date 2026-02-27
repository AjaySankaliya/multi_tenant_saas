import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/checkRole";
import { addTask } from "../controllers/taskController";
const router=Router();


router.post('/',authenticate,adminOnly,addTask)


export default router;


// POST /api/tasks      (ADMIN)
// GET  /api/tasks      (USER)
// PUT  /api/tasks/:id  (USER → status update)