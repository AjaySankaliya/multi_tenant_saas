import { config } from "dotenv";
import express, { Request, Response } from "express";
import {connectDB} from "./config/dbConnection";
import authRouter from "./routers/authRouter"
import projectRouter from "./routers/projectRouter"
import taskRouter from "./routers/taskRouter"
config();

const app=express();

app.use(express.json())

app.use('/api/auth',authRouter)
app.use('/api/project',projectRouter)
app.use('/api/tasks',taskRouter)

const PORT=process.env.PORT;
app.listen(PORT,async()=>{
    console.log(`server have running on http://localhost:${PORT}`);
    await connectDB()
    console.log(`swagger ui http://localhost:${PORT}/api-docs`);
})