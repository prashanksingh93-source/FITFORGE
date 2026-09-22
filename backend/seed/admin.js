import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email =
      "admin@fitforge.com";

    const password =
      "Admin@123456";

    const existingAdmin =
      await User.findOne({
        email,
      });

    if (existingAdmin) {
      existingAdmin.role = "admin";

      await existingAdmin.save();

      console.log(
        "Existing user promoted to admin"
      );

      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    await User.create({
      fullName: "FITFORGE Admin",
      email,
      password: hashedPassword,
      phone: "",
      role: "admin",
    });

    console.log(
      "FITFORGE admin created successfully"
    );

    console.log(
      "Email:",
      email
    );

    console.log(
      "Password:",
      password
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error
    );

    process.exit(1);
  }
};

createAdmin();