import { Request, Response } from "express";
import { AuthRequest } from "../types/express";
import { db } from "../config/dbConnection";

export const addProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    await db.query(
      "insert into projects (name,description,tenant_id,created_by) values(?,?,?,?)",
      [title, description, tenantId, userId],
    );

    return res.status(201).json({
      success: true,
      message: "Project Created successfully",
    });
  } catch (error) {
    console.error("Add Project Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {

    const tenantId=req.user?.tenantId;

    const [rows]:any=await db.query("select * from projects where tenant_id=?",[tenantId]);

    return res.status(200).json({
        success:true,
        project:rows
    })

  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
