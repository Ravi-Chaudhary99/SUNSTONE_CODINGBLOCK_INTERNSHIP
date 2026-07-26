let currentRole = 'Admin';

document.addEventListener("DOMContentLoaded", () => {
    initializeWorkspace();
    fetchAnalytics();
});

function switchRole(role) {
    currentRole = role;
    document.getElementById('current-role').innerText = `Role: ${role}`;
    
    // Role permissions enforcement
    const addBtn = document.getElementById('btn-add-task');
    if (role === 'Client') {
        addBtn.style.display = 'none';
    } else {
        addBtn.style.display = 'block';
    }
}

async function initializeWorkspace() {
    const res = await fetch('/api/workspace');
    const data = await res.json();
    
    renderKanban(data.tasks);
    renderGantt(data.tasks);
    renderOKRs(data.okrs);
    renderChat(data.messages);
    renderFiles(data.files);
    renderExpenses(data.expenses);
}

async function fetchAnalytics() {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    
    document.getElementById('stat-completion').innerText = `${data.completionRate}%`;
    document.getElementById('stat-hours').innerText = `${data.totalHours} hrs`;
    document.getElementById('stat-billable').innerText = `${data.billableHours} hrs`;
    document.getElementById('stat-revenue').innerText = `$${data.estimatedRevenue}`;
}

// Kanban Renderer with Role Check
function renderKanban(tasks) {
    document.getElementById('todo-cards').innerHTML = '';
    document.getElementById('in-progress-cards').innerHTML = '';
    document.getElementById('done-cards').innerHTML = '';

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = task.id;
        card.draggable = currentRole !== 'Client';
        
        card.innerHTML = `
            <div><strong>${task.title}</strong></div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">👤 ${task.assigned_to}</div>
            <div class="card-meta">
                <span>⏱️ ${task.hours} hrs</span>
                <span style="color: ${task.billable ? '#34d399' : '#94a3b8'}">${task.billable ? '💰 Billable' : '☕ Internal'}</span>
            </div>
        `;
        
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });

        const targetCol = document.getElementById(`${task.status}-cards`);
        if (targetCol) targetCol.appendChild(card);
    });
}

// Gantt Timeline Generator
function renderGantt(tasks) {
    const container = document.getElementById('gantt-rows-container');
    container.innerHTML = '';

    tasks.forEach((task, idx) => {
        const row = document.createElement('div');
        row.className = 'gantt-item-row';
        
        let leftMargin = (idx * 15) % 50;
        let barWidth = 30 + (task.hours * 2);

        row.innerHTML = `
            <div class="gantt-label-col">${task.title}</div>
            <div class="gantt-timeline-col">
                <div class="gantt-bar" style="margin-left: ${leftMargin}%; width: ${Math.min(barWidth, 80)}%;">
                    ${task.start_date || 'Jul 1'} - ${task.end_date || 'Jul 15'}
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

function renderOKRs(okrs) {
    const container = document.getElementById('okr-list');
    container.innerHTML = okrs.map(o => `
        <div style="margin-bottom: 10px; font-size: 0.85rem;">
            <div>${o.goal} (<strong>${o.progress}%</strong>)</div>
            <div style="background: #1e293b; height: 6px; border-radius: 3px; margin-top: 4px; overflow: hidden;">
                <div style="background: #34d399; height: 100%; width: ${o.progress}%;"></div>
            </div>
        </div>
    `).join('');
}

function renderChat(messages) {
    const stream = document.getElementById('chat-stream');
    stream.innerHTML = messages.map(m => `
        <div class="msg-bubble">
            <div class="msg-sender">${m.sender}</div>
            <div>${m.text}</div>
        </div>
    `).join('');
    stream.scrollTop = stream.scrollHeight;
}

function renderFiles(files) {
    const container = document.getElementById('file-list');
    if (!files.length) { container.innerHTML = '<div style="color: #94a3b8;">No files uploaded.</div>'; return; }
    container.innerHTML = files.map(f => `
        <div class="file-item">
            <span>📄 ${f.original_name}</span>
            <a href="/uploads/${f.filename}" target="_blank" style="color: #38bdf8; text-decoration: none;">View</a>
        </div>
    `).join('');
}

function renderExpenses(expenses) {
    const container = document.getElementById('expense-list');
    if (!expenses.length) { container.innerHTML = '<div style="color: #94a3b8;">No expenses logged.</div>'; return; }
    container.innerHTML = expenses.map(e => `
        <div class="expense-item">
            <span>🏷️ ${e.item}: <strong>$${e.amount}</strong></span>
            ${e.receipt ? `<a href="/uploads/${e.receipt}" target="_blank" style="color: #34d399; text-decoration: none;">Receipt</a>` : ''}
        </div>
    `).join('');
}

// Drag & Drop Handlers
function allowDrop(e) { if (currentRole !== 'Client') e.preventDefault(); }

async function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    let targetCol = e.target.closest('.column');
    if (!targetCol) return;

    await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetCol.id })
    });
    
    initializeWorkspace();
    fetchAnalytics();
}

// Modal Handlers
function toggleTaskModal() {
    const modal = document.getElementById('task-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

async function submitTask() {
    const title = document.getElementById('task-title').value;
    const hours = document.getElementById('task-hours').value;
    const billable = document.getElementById('task-billable').checked;
    const start_date = document.getElementById('task-start').value;
    const end_date = document.getElementById('task-end').value;
    const assigned_to = document.getElementById('task-assignee').value;

    if (!title) return alert('Title required');

    await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, hours, billable, start_date, end_date, assigned_to })
    });

    toggleTaskModal();
    initializeWorkspace();
    fetchAnalytics();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input.value.trim()) return;

    await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: `User (${currentRole})`, text: input.value })
    });
    
    input.value = '';
    initializeWorkspace();
}

async function uploadFile(e) {
    e.preventDefault();
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('uploader', currentRole);

    await fetch('/api/files/upload', { method: 'POST', body: formData });
    fileInput.value = '';
    initializeWorkspace();
}

async function logExpense(e) {
    e.preventDefault();
    const item = document.getElementById('expense-item').value;
    const amount = document.getElementById('expense-amount').value;
    const receiptInput = document.getElementById('expense-receipt');

    const formData = new FormData();
    formData.append('item', item);
    formData.append('amount', amount);
    if (receiptInput.files[0]) formData.append('receipt', receiptInput.files[0]);

    await fetch('/api/expenses', { method: 'POST', body: formData });
    
    document.getElementById('expense-form').reset();
    initializeWorkspace();
}
