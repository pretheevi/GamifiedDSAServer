// database/db.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "database.db");

// Create DB file or open existing
const db = new Database(dbPath);

// Optional: enforce foreign keys
db.pragma('foreign_keys = ON');

export default db;