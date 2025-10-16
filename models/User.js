// Import necessary modules
import { fileURLToPath } from "url";
import path from "path";
import db from "../db.js";

import HashingService from "../service/hashingService.js";
import ApiResponse from "../utility/apiResponse.js";

class UserModel {
  static initTable() {
    try {
      db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT,
          password TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ).run();
    } catch (err) {
      console.error("Error creating users table:", err);
    }
  }

  static findByEmail(email) {
    try {
      return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    } catch (err) {
      console.error("Error finding user by email:", err);
      ApiResponse.serverError(err, "Database Error");
    }
  }

  static async authenticateUser(email, password) {
    const user = UserModel.findByEmail(email);
    if (!user || user.length === 0)
      ApiResponse.clientError(`No account found with email ${email}`);

    const isPasswordValid = await HashingService.compare(
      password,
      user.password
    );
    if (!isPasswordValid) ApiResponse.clientError("Invalid password");

    return { id: user.id, email: user.email };
  }

  static createUser(username, email, password) {
    try {
      const result = db
        .prepare(
          `
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
      `
        )
        .run(username, email, password);

      console.log("User inserted successfully:", result);
    } catch (err) {
      console.log("Error inserting user:", err);
      ApiResponse.serverError(err, "Database Error");
    }
  }

  static async registerUser(username, email, password) {
    const isEmailExist = await UserModel.findByEmail(email);
    if (isEmailExist) {
      ApiResponse.clientError(`This Email already has account`);
    }

    const otpVerification = db
      .prepare(`SELECT is_verified FROM otp_verification WHERE email = ?`)
      .get(email);

    if (!otpVerification || otpVerification.is_verified === 0) {
      ApiResponse.clientError(`OTP not verified for email ${email}`);
    }

    const hashedPassword = await HashingService.hash(password);
    UserModel.createUser(username, email, hashedPassword);
    return { username, email };
  }

  static async getUserInfo(id) {
    if(!id) {
      ApiResponse.clientError("User ID is required");
    }

    try {
      const query = `
        SELECT 
        u.username,
        u.email,
        u.updated_at
      FROM users AS u
      WHERE u.id = ?;
      `;
      return db.prepare(query).get(id);
    } catch(err) {
      console.error("Error fetching user info:", err);
      ApiResponse.serverError(err, "Database Error");
    }
  }
}

export default UserModel;

// Helper code to check if this file is being executed directly
const filePath = fileURLToPath(import.meta.url);
const currentFileExecutionPath = path.resolve(process.argv[1]);

if (filePath === currentFileExecutionPath) {
}
