import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'feedx.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrent access
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Create tables
export const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      pin TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Login logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      success INTEGER DEFAULT 1,
      device_info TEXT
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Updates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      images TEXT,
      priority TEXT DEFAULT 'medium',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Resources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT,
      tags TEXT,
      files TEXT,
      images TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      register_link TEXT,
      files TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Spotlight table
  db.exec(`
    CREATE TABLE IF NOT EXISTS spotlight (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      images TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Testimonials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Gallery table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully at:', dbPath);
};

export default db;
