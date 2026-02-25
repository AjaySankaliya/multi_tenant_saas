import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { db } from "../config/dbConnection";
import { configDotenv } from "dotenv";
import { AuthRequest } from "../types/express";
configDotenv();
//company and admin register
export const registerCompanyController = async (
  req: Request,
  res: Response,
) => {
  const { companyName, companyEmail, adminName, adminEmail, adminPassword } =
    req.body;
  if (
    !companyName ||
    !companyEmail ||
    !adminName ||
    !adminEmail ||
    !adminPassword
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check tenant email
    const [existingTenant]: any = await db.query(
      "SELECT id FROM tenants WHERE email = ?",
      [companyEmail],
    );
    if (existingTenant.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Company email already registered" });
    }

    // Insert tenant
    const [tenantResult]: any = await db.query(
      "INSERT INTO tenants (name,email) VALUES (?,?)",
      [companyName, companyEmail],
    );
    const tenantId = tenantResult.insertId;

    // Check admin email
    const [existingUser]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail],
    );
    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Admin email already registered" });
    }

    // Hash password & insert admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.query(
      "INSERT INTO users (name,email,password,role,tenant_id) VALUES (?,?,?,'ADMIN',?)",
      [adminName, adminEmail, hashedPassword, tenantId],
    );

    return res.status(201).json({
      success: true,
      message: "Company & Admin registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//admin login
export const adminLoginController = async (req: Request, res: Response) => {
  const { adminEmail, adminPassword } = req.body;

  if (!adminEmail || !adminPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const [users]: any = await db.query(
    "select id,password,role,tenant_id from users where email=? and role='ADMIN'",
    [adminEmail],
  );

  if (users.length == 0) {
    return res
      .status(404)
      .json({ success: false, message: "user have not register" });
  }

  const user = users[0];

  const isPasswordMatch = await bcrypt.compare(adminPassword, user.password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = await jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",  
    },
  );

  return res.status(200).json({
    success: true,
    token,
    user:{
      userId:user.id,
      role:user.role,
      tenantId:user.tenant_id
    }
  });
};

export const registerController = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [existUser]: any = await db.query(
      "select id from users where email=?",
      [email],
    );

    if (existUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "user have all ready exists",
      });
    }

    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant not found in token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "insert into users (name,email,password,tenant_id) values(?,?,?,?)",
      [name, email, hashedPassword, tenantId],
    );

    return res.status(201).json({
      success: true,
      message: "user register successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const loginController = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const [users]: any = await db.query(
    "select id,password,role,tenant_id from users where email=?",
    [email],
  );

  if (users.length == 0) {
    return res
      .status(404)
      .json({ success: false, message: "user have not register" });
  }

  const user = users[0];

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = await jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",  
    },
  );

  return res.status(200).json({
    success: true,
    token,
    user:{
      userId:user.id,
      role:user.role,
      tenantId:user.tenant_id
    }
  });
};