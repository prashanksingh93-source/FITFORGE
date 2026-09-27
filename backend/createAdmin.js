import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // ==========================================
    // ADMIN LOGIN DETAILS
    // ==========================================

    const ADMIN_EMAIL = "annu@gmail.com";
    const ADMIN_PASSWORD = "annu@123";
    const ADMIN_NAME = "Prashank Singh";

    // ==========================================
    // CHECK MONGODB
    // ==========================================

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("======================================");
    console.log("✅ MongoDB Connected");
    console.log("======================================");

    // ==========================================
    // CHECK EXISTING USER
    // ==========================================

    const existingUser = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    // ==========================================
    // IF USER ALREADY EXISTS
    // ==========================================

    if (existingUser) {
      console.log("⚠️ User already exists");

      // Convert existing user to admin
      existingUser.role = "admin";
      existingUser.isBlocked = false;

      // Set new password
      existingUser.password = await bcrypt.hash(
        ADMIN_PASSWORD,
        12
      );

      await existingUser.save();

      console.log("");
      console.log("======================================");
      console.log("✅ ADMIN UPDATED SUCCESSFULLY");
      console.log("======================================");
      console.log("Name:", existingUser.fullName);
      console.log("Email:", ADMIN_EMAIL);
      console.log("Password:", ADMIN_PASSWORD);
      console.log("Role:", existingUser.role);
      console.log("======================================");

      await mongoose.disconnect();
      process.exit(0);
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    // ==========================================
    // CREATE ADMIN
    // ==========================================

    const admin = await User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      phone: "",
      password: hashedPassword,
      role: "admin",
      isBlocked: false,
    });

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log("");
    console.log("======================================");
    console.log("🎉 ADMIN CREATED SUCCESSFULLY");
    console.log("======================================");
    console.log("Name:", admin.fullName);
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("Role:", admin.role);
    console.log("======================================");
    console.log("");

    await mongoose.disconnect();

    console.log("✅ MongoDB disconnected");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("❌ ADMIN CREATION FAILED");
    console.error("======================================");
    console.error(error.message);
    console.error("======================================");

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect error
    }

    process.exit(1);
  }
};

createAdmin();
