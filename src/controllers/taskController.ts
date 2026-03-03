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

export const assignTask=async(req:AuthRequest,res:Response)=>{
  try {

    const {taskId}=req.params;
    const { assignedTo }=req.body;
    const tenantId=req.user?.tenantId;

    const [task]:any=await db.query(
      "select id from tasks where id=? and tenant_id=?",
      [taskId,tenantId]
    );

    if(task.length==0)
    {
      return res.status(400).json({success:false,message:"task have not found"})
    }

    const [user]:any=await db.query(
      "select id from users where id=? and tenant_id=?",
      [assignedTo,tenantId]
    );

    if (user.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to your tenant",
      });
    }

    await db.query("update tasks set assigned_to=?,assigned_at=NOW() where id=? and tenant_id=?",[assignedTo,taskId,tenantId])
   
    return res.status(200).json({
      success:true,
      message:`Task assigned to user no.${assignedTo} successfully `
    })


  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;
    const role = req.user?.role;

    let sql = "";
    let values: any[] = [];

    if (role === "ADMIN") {
      sql = `
        SELECT t.*, 
               u.name AS assigned_user,
               p.name AS project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.tenant_id = ?
        ORDER BY t.created_at DESC
      `;
      values = [tenantId];
    } else {
      sql = `
        SELECT t.*, 
               p.name AS project_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.tenant_id = ?
        AND t.assigned_to = ?
        ORDER BY t.created_at DESC
      `;
      values = [tenantId, userId];
    }

    const [tasks]: any = await db.query(sql, values);

    return res.status(200).json({
      success: true,
      data: tasks,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

