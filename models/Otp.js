import { fileURLToPath } from "url";
import path from "path";
import db from "../db.js";

import Email from "../service/emailService.js";
import HashingService from "../service/hashingService.js";
import ApiResponse from "../utility/apiResponse.js";

class OTPModel {
  static initTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS otp_verification (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          otp TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          is_verified BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(email, otp)
      );`;
    try {
      db.prepare("BEGIN").run();
      db.prepare(query).run();
      db.prepare("COMMIT").run();
      console.log("OTP verification table created successfully");
    } catch (err) {
      db.prepare("ROLLBACK").run();
      console.error("Error creating OTP verification table:", err);
    }
  }

  static checkSchema() {
    try {
      const schema = db.prepare("PRAGMA table_info('otp_verification');").all();
      console.log(schema);
    } catch (err) {
      console.error("Error checking schema:", err);
    }
  }

  static async storeOtp(email, otp, expiryTime) {
    const query = `
      INSERT INTO otp_verification(email, otp, expires_at, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP);
    `;
    try {
      const hashOTP = await HashingService.hash(otp);

      try {
        db.prepare("BEGIN").run();
        db.prepare("DELETE FROM otp_verification WHERE email = ?").run(email);
        db.prepare(query).run(email, hashOTP, expiryTime);
        db.prepare("COMMIT").run();
      } catch (err) {
        db.prepare("ROLLBACK").run();
        ApiResponse.serverError(err, "Database Error");
      }

      console.log("OTP saved successfully for email:", email);
    } catch (err) {
      console.error("Error saving OTP:", err);
      ApiResponse.serverError(err, "Database Error");
    }
  }

  static findByEmail(email) {
    try {
      const query = `
        SELECT * FROM otp_verification
        WHERE email = ?
      `;
      return db.prepare(query).get(email);
    } catch (err) {
      ApiResponse.serverError(err, "Database Error");
    }
  }

  static findValidOtpByEmail(email) {
    const query = `
      SELECT * FROM otp_verification
      WHERE email = ? AND expires_at > CURRENT_TIMESTAMP AND is_verified = 0
      ORDER BY created_at DESC LIMIT 1;
    `;
    try {
      const result = db.prepare(query).get(email);
      return result;
    } catch (err) {
      ApiResponse.serverError(err, "Database Error");
    }
  }

  static async verifyOtpForEmail(email, otp) {
    try {
      const result = await OTPModel.findValidOtpByEmail(email);
      if (!result) ApiResponse.clientError("Invalid or expired OTP");

      const isOtpValid = await HashingService.compare(otp, result.otp);
      if (!isOtpValid) ApiResponse.clientError("Invalid OTP");

      const query = `
        UPDATE otp_verification
        SET is_verified = 1
        WHERE id = ?;
      `;
      try {
        db.prepare("BEGIN").run();
        db.prepare(query).run(result.id);
        db.prepare("COMMIT").run();
      } catch (err) {
        db.prepare("ROLLBACK").run();
        console.error("Error updating OTP verification status:", err);
        ApiResponse.serverError(err, "Database Error");
      }

      console.log("OTP verified successfully for email:", email);
      return true;
    } catch (err) {
      console.error("Error verifying OTP:", err);
      ApiResponse.serverError(err, err.message || "Database Error");
    }
  }
}

const filePath = fileURLToPath(import.meta.url);
const currentFileExecutionPath = path.resolve(process.argv[1]);
if (filePath === currentFileExecutionPath) {
  console.error("This file is executed directly:", filePath);
}

export default OTPModel;
