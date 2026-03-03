import { Request } from "express";

export interface AuthRequest extends Request{
     user?:{
        userId:number,
        tenantId:number,
        role:String
    }
}