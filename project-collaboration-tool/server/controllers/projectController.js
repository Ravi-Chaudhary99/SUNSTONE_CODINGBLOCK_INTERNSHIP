const express = require('express');
const router = express.Router();

// Robust mock database seed fulfilling requirements (Tasks, OKRs, Messages, Expenses)
let workspaceData = {
    tasks: [
        { id: "t1", title: "Setup Database Schema", status: "todo", hours: 4, billable: true, start: "2026-07-01", end: "2026-07-03" },
        { id: "t2", title: "Design Kanban Workspace UI", status: "in-progress", hours: 12, billable: true, start: "2026-07-02", end: "2026-07-06" },
        { id: "t3", title: "Project Kickoff & Requirements Verification", status: "done", hours: 2, billable: false, start: "2026-07-01", end: "2026-07-02" }
    ],
    okrs: [
        { id: "o1", goal: "Launch MVP Platform", progress: 65 },
        { id: "o2", goal: "Optimize App Load Timings under 2s", progress: 40 }
    ],
    messages: [
        { sender: "Alex (PM)", text: "Welcome team! Let's update our task boards daily." },
        { sender: "Dev Jordan", text: "Working on the Kanban drag-and-drop animation mechanics now." }
    ],
    expenses: [
        { item: "Cloud Server Hosting", amount: 45.00, status: "Approved" }
    ]
};

// GET whole workspace state
router.get('/', (req, res) => {
    res.json(workspaceData);
});

// PUT update task placement status (Kanban drop mechanics)
router.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let task = workspaceData.tasks.find(t => t.id === id);
    if (task) {
        task.status = status;
        return res.json({ success: true, tasks: workspaceData.tasks });
    }
    res.status(404).json({ success: false, message: "Task context target missing." });
});

// POST append instant messages
router.post('/messages', (req, res) => {
    const { sender, text } = req.body;
    if (sender && text) {
        workspaceData.messages.push({ sender, text });
        return res.json({ success: true, messages: workspaceData.messages });
    }
    res.status(400).json({ success: false });
});

module.exports = router;
