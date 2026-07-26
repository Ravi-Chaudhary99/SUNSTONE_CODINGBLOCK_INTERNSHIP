const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, 'workspace.db'));

db.serialize(() => {
    // Users table with Role-based access (Admin, Member, Client)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'Member'
    )`);

    // Projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tasks table with Time Tracking & Dependencies
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        title TEXT,
        status TEXT DEFAULT 'todo',
        hours REAL DEFAULT 0,
        billable INTEGER DEFAULT 1,
        start_date TEXT,
        end_date TEXT,
        dependency_id INTEGER DEFAULT NULL,
        assigned_to TEXT DEFAULT 'Unassigned'
    )`);

    // OKRs Table
    db.run(`CREATE TABLE IF NOT EXISTS okrs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        goal TEXT,
        progress INTEGER DEFAULT 0
    )`);

    // Messages Table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        sender TEXT,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Shared Files Table
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        filename TEXT,
        original_name TEXT,
        uploaded_by TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Expenses Table with Receipt Uploads
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        item TEXT,
        amount REAL,
        receipt TEXT,
        status TEXT DEFAULT 'Pending'
    )`);

    // Seed Initial Data if empty
    db.get("SELECT COUNT(*) AS count FROM users", [], (err, row) => {
        if (row && row.count === 0) {
            const hash = bcrypt.hashSync('admin123', 10);
            db.run(`INSERT INTO users (name, email, password, role) VALUES 
                ('Ankush Admin', 'admin@pro.com', '${hash}', 'Admin'),
                ('Developer Alex', 'alex@pro.com', '${hash}', 'Member'),
                ('Client Viewer', 'client@pro.com', '${hash}', 'Client')`);

            db.run(`INSERT INTO projects (name, description) VALUES ('Enterprise App Launch', 'Full stack collaboration platform')`);
            
            db.run(`INSERT INTO tasks (project_id, title, status, hours, billable, start_date, end_date, assigned_to) VALUES 
                (1, 'Database Architecture & Schema', 'done', 8, 1, '2026-07-01', '2026-07-05', 'Ankush Admin'),
                (1, 'Kanban Drag & Drop Interface', 'in-progress', 12, 1, '2026-07-06', '2026-07-12', 'Developer Alex'),
                (1, 'Stripe Gateway Integration', 'todo', 6, 1, '2026-07-13', '2026-07-20', 'Developer Alex')`);

            db.run(`INSERT INTO okrs (project_id, goal, progress) VALUES 
                (1, 'Launch Platform MVP', 70),
                (1, 'Sub-2s API Response Performance', 45)`);

            db.run(`INSERT INTO messages (project_id, sender, text) VALUES 
                (1, 'Ankush Admin', 'Welcome team! Database structure is complete.'),
                (1, 'Developer Alex', 'Working on the drag and drop and file uploads now.')`);
        }
    });
});

module.exports = db;
