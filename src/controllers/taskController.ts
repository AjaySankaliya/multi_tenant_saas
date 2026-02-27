import { Response } from "express";
import { AuthRequest } from "../types/express";
import { db } from "../config/dbConnection";

export const addTask = async (req: AuthRequest, res: Response) => {
    try {
      const {title,description,status,priority,project_id}=req.body;

      if(!title || !description || !project_id)
      {
        return res.status(400).json({
          success:false,
          message:"Title and ProjectID are required"
        })
      }

      const [project]:any=await db.query(
        "select * from projects where id=? and tenant_id=?",
        [project_id,req.user?.tenantId]
      )

      if (project.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Project not found in your tenant",
      });
    }

    const tenantId=req.user?.tenantId;

    const sql=`insert into tasks (title,description,status,priority,project_id,tenant_id) 
    values (?,?,?,?,?,?)`;

    const values=[
      title,
      description,
      status || "TODO",
      priority || "MEDIUM",
      project_id,
      tenantId
    ]

    await db.query(sql,values);

    return res.status(201).json({
      success:true,
      message:"Task Added successfully"
    })
    } catch (error) {
      return res.status(500).json({
        success:false,
        message:"Internal server error"
      })
    }
};


