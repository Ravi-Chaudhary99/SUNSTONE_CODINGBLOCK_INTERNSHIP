document.addEventListener("DOMContentLoaded", initializeWorkspace);

// High level data sync architecture fetch
async function initializeWorkspace() {
    const response = await fetch('/api/workspace');
    const data = await response.json();
    
    renderKanban(data.tasks);
    renderGantt(data.tasks);
    renderOKRs(data.okrs);
    renderChat(data.messages);
    renderExpenses(data.expenses);
}

// Kanban Render Execution Engine
function renderKanban(tasks) {
    document.getElementById('todo-cards').innerHTML = '';
    document.getElementById('in-progress-cards').innerHTML = '';
    document.getElementById('done-cards').innerHTML = '';

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = task.id;
        card.draggable = true;
        card.innerHTML = `
            <div>${task.title}</div>
            <div class="card-meta">
                <span>⏱️ ${task.hours} hrs</span>
                <span style="color: ${task.billable ? '#34d399' : '#94a3b8'}">${task.billable ? '💰 Billable' : '☕ Internal'}</span>
            </div>
        `;
        
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });

        document.getElementById(`${task.status}-cards`).appendChild(card);
    });
}

// Gantt Chart Logic Mapping Grid
function renderGantt(tasks) {
    const container = document.getElementById('gantt-rows-container');
    container.innerHTML = '';

    tasks.forEach((task, index) => {
        const row = document.createElement('div');
        row.className = 'gantt-item-row';
        
        // Dynamically compute mock offsets for timeline visualization bars
        let leftMargin = 5 + (index * 15);
        let barWidth = 35 + (index * 10);

        row.innerHTML = `
            <div class="gantt-label-col">${task.title}</div>
            <div class="gantt-timeline-col">
                <div class="gantt-bar" style="margin-left: ${leftMargin}%; width: ${barWidth}%;">
                    ${task.start} / ${task.end}
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// Ancillary Sidebar Renderings
function renderOKRs(okrs) {
    const container = document.getElementById('okr-list');
    container.innerHTML = '';
    okrs.forEach(o => {
        container.innerHTML += `
            <div class="okr-item">
                <div>${o.goal} (<strong>${o.progress}%</strong>)</div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${o.progress}%"></div></div>
            </div>
        `;
    });
}

function renderChat(messages) {
    const stream = document.getElementById('chat-stream');
    stream.innerHTML = '';
    messages.forEach(m => {
        stream.innerHTML += `
            <div class="msg-bubble">
                <div class="msg-sender">${m.sender}</div>
                <div>${m.text}</div>
            </div>
        `;
    });
    stream.scrollTop = stream.scrollHeight;
}

function renderExpenses(expenses) {
    const container = document.getElementById('expense-list');
    container.innerHTML = '';
    expenses.forEach(e => {
        container.innerHTML += `<div>📍 ${e.item}: <strong>$${e.amount.toFixed(2)}</strong> [${e.status}]</div>`;
    });
}

// Interactive Native Handlers
function allowDrop(e) { e.preventDefault(); }

async function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    let targetCol = e.target.closest('.column');
    if (!targetCol) return;

    const res = await fetch(`/api/workspace/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetCol.id })
    });
    const updated = await res.json();
    if (updated.success) initializeWorkspace();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input.value.trim()) return;

    const res = await fetch('/api/workspace/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: "You (Student)", text: input.value })
    });
    if (res.ok) {
        input.value = '';
        initializeWorkspace();
    }
}
