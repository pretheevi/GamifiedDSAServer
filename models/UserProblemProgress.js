import { fileURLToPath } from "url";
import path from "path";
import db from "../db.js";

import ApiResponse from "../utility/apiResponse.js";

class UserProblemProgressModel {
  static createUserProblemProgressTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS user_problem_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      problem_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('Not Started', 'In Progress', 'Solved')) DEFAULT 'Not Started',
      time_spent INTEGER DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (problem_id) REFERENCES problems(id),
      UNIQUE(user_id, problem_id)
        );`;
    try {
      db.prepare("BEGIN").run();
      db.prepare(query).run();
      db.prepare("COMMIT").run();
      console.log("user problem progress table created successfully");
    } catch (err) {
      db.prepare("ROLLBACK").run();
      console.error("Error creating user problem progress table:", err);
    }
  }

  static updateUserProblemProgress(userId, problemId, status, timeSpent) {
    try {
      console.log({ userId, problemId, status, timeSpent });


      if (isNaN(timeSpent)) throw new Error(`Invalid timeSpent: ${timeSpent}`);

      const existingRecord = db.prepare(`
        SELECT id FROM user_problem_progress 
        WHERE user_id = ? AND problem_id = ?
      `).get(userId, problemId);
      
      console.log("Existing record:", existingRecord);
      let result;

      if (existingRecord) {
        const updateStmt = db.prepare(`
          UPDATE user_problem_progress
          SET status = ?, 
              time_spent = time_spent + ?, 
              last_updated = CURRENT_TIMESTAMP
          WHERE user_id = ? AND problem_id = ?
        `);
        result = updateStmt.run(status, timeSpent, userId, problemId);
      } else {
        const insertStmt = db.prepare(`
          INSERT INTO user_problem_progress(user_id, problem_id, status, time_spent, last_updated)
          VALUES(?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        result = insertStmt.run(userId, problemId, status, timeSpent);
      }

      console.log("Update result:", result);
      return {
        success: true,
        action: existingRecord ? "updated" : "created",
        changes: result.changes,
        id: existingRecord ? existingRecord.id : result.lastInsertRowid,
      };
    } catch (err) {
      console.error("Error updating user problem progress:", err);
      return ApiResponse.serverError(err, "Database Error");
    } finally {
            console.log(typeof userId, typeof problemId, typeof status, typeof timeSpent);
    }
  } 

  static updateProblemStatusSolved(userId, problemId, status) {
    try {
      if (status !== "Solved") {
        throw new Error(`Invalid status: ${status}. Only 'Solved' status can be updated.`);
      }

      const existingRecord = db.prepare(`
        SELECT id FROM user_problem_progress 
        WHERE user_id = ? AND problem_id = ?
      `).get(userId, problemId);
      
      if (!existingRecord) {
        throw new Error(`No record found for user_id: ${userId} and problem_id: ${problemId}`);
      }

      // Fixed SQL - removed extra comma
      const updateStmt = db.prepare(`
        UPDATE user_problem_progress
        SET status = ?
        WHERE user_id = ? AND problem_id = ?
      `).run(status, userId, problemId);
      
      return { 
        success: true, 
        action: "updated", 
        changes: updateStmt.changes,
        userId,
        problemId,
        status 
      };
      
    } catch(err) {
      console.error("Error updating problem status:", err);
      throw err; // Re-throw to let router handle it
    }
  }

}

const filePath = fileURLToPath(import.meta.url);
const currentFileExecutionPath = path.resolve(process.argv[1]);
if (filePath === currentFileExecutionPath) {
  console.error("This file is executed directly:", filePath);
}

export default UserProblemProgressModel;
