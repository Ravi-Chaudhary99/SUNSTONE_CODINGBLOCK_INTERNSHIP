const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'super_secret_assignment_key_2026';

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure Multer File Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
    });
});

// --- WORKSPACE DATA ROUTE ---
app.get('/api/workspace', (req, res) => {
    db.all(`SELECT * FROM tasks`, [], (err, tasks) => {
        db.all(`SELECT * FROM okrs`, [], (err, okrs) => {
            db.all(`SELECT * FROM messages ORDER BY id ASC`, [], (err, messages) => {
                db.all(`SELECT * FROM files ORDER BY id DESC`, [], (err, files) => {
                    db.all(`SELECT * FROM expenses ORDER BY id DESC`, [], (err, expenses) => {
                        res.json({ tasks, okrs, messages, files, expenses });
                    });
                });
            });
        });
    });
});

// --- TASK MANAGEMENT (Kanban + Drag-and-Drop) ---
app.post('/api/tasks', (req, res) => {
    const { title, hours, billable, start_date, end_date, assigned_to } = req.body;
    db.run(`INSERT INTO tasks (project_id, title, hours, billable, start_date, end_date, assigned_to) VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [title, hours || 0, billable ? 1 : 0, start_date, end_date, assigned_to || 'Unassigned'],
        function(err) {
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.put('/api/tasks/:id', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        res.json({ success: true });
    });
});

// --- FILE UPLODS (File Sharing Feature) ---
app.post('/api/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { uploader } = req.body;
    db.run(`INSERT INTO files (project_id, filename, original_name, uploaded_by) VALUES (1, ?, ?, ?)`,
        [req.file.filename, req.file.originalname, uploader || 'User'],
        function(err) {
            res.json({ success: true, filename: req.file.filename });
        }
    );
});

// --- EXPENSES & RECEIPT UPLOAD ---
app.post('/api/expenses', upload.single('receipt'), (req, res) => {
    const { item, amount } = req.body;
    const receiptName = req.file ? req.file.filename : null;
    db.run(`INSERT INTO expenses (project_id, item, amount, receipt) VALUES (1, ?, ?, ?)`,
        [item, parseFloat(amount), receiptName],
        function(err) {
            res.json({ success: true });
        }
    );
});

// --- MESSAGING ---
app.post('/api/messages', (req, res) => {
    const { sender, text } = req.body;
    db.run(`INSERT INTO messages (project_id, sender, text) VALUES (1, ?, ?)`, [sender, text], function(err) {
        res.json({ success: true });
    });
});

// --- ANALYTICS DASHBOARD ROUTE ---
app.get('/api/analytics', (req, res) => {
    db.all(`SELECT status, hours, billable FROM tasks`, [], (err, tasks) => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const totalHours = tasks.reduce((sum, t) => sum + (t.hours || 0), 0);
        const billableHours = tasks.filter(t => t.billable === 1).reduce((sum, t) => sum + (t.hours || 0), 0);
        const health = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({
            completionRate: health,
            totalTasks: total,
            completedTasks: completed,
            totalHours,
            billableHours,
            estimatedRevenue: billableHours * 75 // $75/hr billing rate
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Assignment Server running live at http://localhost:${PORT}`);
});
