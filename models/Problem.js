import { fileURLToPath } from "url";
import path from "path";
import db from "../db.js";

import ApiResponse from "../utility/apiResponse.js";

class ProblemModel {
  static createProblemTable() {
    const query = `
		CREATE TABLE IF NOT EXISTS problems (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		slug TEXT UNIQUE NOT NULL,
		url TEXT NOT NULL,
		topic TEXT,
		difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
		xp_value INTEGER DEFAULT 10,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
							);`;
    try {
      db.prepare("BEGIN").run();
      db.prepare(query).run();
      db.prepare("COMMIT").run();
      console.log("Problem table created successfully.");
    } catch (err) {
      db.prepare("ROLLBACK").run(); // undo any partial changes
      console.error("Error creating problem table:", err);
    }
  }

  static checkSchema() {
    try {
      const schema = db.prepare("PRAGMA table_info('problems');").all();
      console.log(schema);
    } catch (err) {
      console.error("Error checking schema:", err);
    }
  }

  static insertProblemsData() {
    // const raw = readFileSync("./problemsData.json", "utf-8");
    // const data = JSON.parse(raw);

    const query = `
					INSERT INTO problems(title, slug, url, topic, difficulty, xp_value, created_at, updated_at)
					VALUES(?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
			`;

    const insertStmt = db.prepare(query);

    try {
      // db.prepare("BEGIN").run();

      // data.forEach((probObj) => {
      //   const { title, slug, url, topic, difficulty, xp_value } = probObj;
      //   insertStmt.run(title, slug, url, topic, difficulty, xp_value);
      // });

      // db.prepare("COMMIT").run();
      console.log("Problems inserted successfully:", data.length);
    } catch (err) {
      // db.prepare("ROLLBACK").run();
      console.error("Error saving problems data", err);
    }
  }

  // Get ALl problem
  static getAllProblem(id) {
    if (!id) {
      ApiResponse.clientError("User ID is required to fetch problems with progress");
      return;
    }
    
    try {
      const query = `
        -- get all problem data with specific user progress updated
          SELECT 
              pb.id AS problem_id,
              pb.title,
              pb.slug,
              pb.url,
              pb.topic,
              pb.difficulty,
              pb.xp_value,
              COALESCE(upp.status, 'not started') AS status,
              COALESCE(upp.time_spent, 0) AS time_spent,
              COALESCE(upp.last_updated, NULL) AS last_updated
          FROM problems AS pb
          LEFT JOIN user_problem_progress AS upp
              ON pb.id = upp.problem_id 
              AND upp.user_id = ?;
      `;
      const data = db.prepare(query).all(id);
      console.log("get all problem:", data.length);
      return data;
    } catch (err) {
      ApiResponse.serverError(err, "Error fetching all problems from database");
    }
  }
}

const filePath = fileURLToPath(import.meta.url);
const currentFileExecutionPath = path.resolve(process.argv[1]);
if (filePath === currentFileExecutionPath) {
  console.error("This file is executed directly:", filePath);
}

export default ProblemModel;
