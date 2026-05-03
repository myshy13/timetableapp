import Database from "better-sqlite3"

const db = new Database("app.db")

export interface User {
  id: number
  uname: string
  name: string
  pwordhash: string
}

export interface RefreshToken {
  id: number
  user_id: number
  token_hash: string
  expires_at: string
}

db.exec(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uname TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    pwordhash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timetables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timetable_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    start DATETIME NOT NULL,
    end DATETIME,
    description TEXT,
    color TEXT NOT NULL,
    teacher TEXT,
    FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE
  )
`) // color: hex colour code (full length, not transparent. Example #5fff3b)

export default db
