const express = require('express');
const path = require('path');
const projectRoutes = require('./controllers/projectController');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Unified Application API Routes
app.use('/api/workspace', projectRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Assignment Server running perfectly at http://localhost:${PORT}`);
});
