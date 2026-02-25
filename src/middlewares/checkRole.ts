import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/express";

export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if(req.user?.role !== "ADMIN")
    {
        return res.status(403).json({
            success:false,
            message:"Admin access only"
        })
    }
    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
