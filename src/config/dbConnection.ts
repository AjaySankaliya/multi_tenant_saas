import mysql from "mysql2/promise"
import { config } from "dotenv"
config()

export const db=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
})


export const connectDB = async (): Promise<void> => {
  try {
    await db.query("SELECT 1")
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}