import './style.css';

// Default Staff
const DEFAULT_STAFF = [
    { id: 1, name: 'John Doe', username: 'john', role: 'Manager', passcode: '1234', joined: Date.now() },
    { id: 2, name: 'Jane Smith', username: 'jane', role: 'Server', passcode: '0000', joined: Date.now() }
];

// State
let staff = JSON.parse(localStorage.getItem('staffData')) || DEFAULT_STAFF;
// Ensure defaults have username if old data exists
staff = staff.map(s => ({
    ...s,
    username: s.username || s.name.split(' ')[0].toLowerCase()
}));

if (!localStorage.getItem('staffData')) {
    localStorage.setItem('staffData', JSON.stringify(staff));
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Staff script loaded');

    // Elements
    const grid = document.getElementById('staffGrid');
    const searchInput = document.getElementById('staffSearch');
    const modal = document.getElementById('staffModal');
    const addBtn = document.getElementById('addStaffBtn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('staffForm');

    // Render
    function render() {
        if (!grid) return;
        grid.innerHTML = '';
        const term = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = staff.filter(s => s.name.toLowerCase().includes(term));

        filtered.forEach(s => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            card.style.position = 'relative';

            let avatarColor = '#3b82f6';
            if (s.role === 'Manager') avatarColor = '#a855f7';
            if (s.role === 'Kitchen') avatarColor = '#f97316';

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.5rem;">
                    <div style="width:40px; height:40px; border-radius:50%; background:${avatarColor}; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; color:white;">
                        ${s.name.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight:700; font-size:1.1rem; color:var(--color-text-primary);">${s.name}</div>
                        <div style="color:var(--color-text-secondary); font-size:0.9rem;">${s.role} (<span style="color:var(--color-accent)">${s.username}</span>)</div>
                    </div>
                </div>
                <div style="font-size:0.85rem; color:var(--color-text-mixed); margin-top:0.5rem;">
                    Passcode: <span style="font-family:monospace; background:rgba(255,255,255,0.1); padding:0.1rem 0.3rem; border-radius:4px;">${s.passcode}</span>
                </div>
                <button class="btn-danger" style="margin-top:1rem; padding:0.25rem 0.5rem; font-size:0.8rem; width:100%;">Remove</button>
            `;

            // Attach delete handler directly
            const delBtn = card.querySelector('.btn-danger');
            delBtn.onclick = () => startDelete(s.id);

            grid.appendChild(card);
        });
    }

    // Actions
    window.startDelete = function (id) {
        if (confirm('Are you sure you want to remove this staff member?')) {
            staff = staff.filter(s => s.id !== id);
            save();
            render();
        }
    };

    function save() {
        localStorage.setItem('staffData', JSON.stringify(staff));
    }

    // Modal Logic using addEventListener
    if (addBtn && modal) {
        addBtn.addEventListener('click', () => {
            console.log('Add clicked');
            modal.style.display = 'flex';
        });
    } else {
        console.error('Add Button or Modal not found', { addBtn, modal });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('staffName').value;
            const username = document.getElementById('staffUsername').value;
            const role = document.getElementById('staffRole').value;
            const code = document.getElementById('staffPasscode').value;

            if (staff.some(s => s.username === username)) {
                alert('Username already exists!');
                return;
            }

            const newStaff = {
                id: Date.now(),
                name,
                username,
                role,
                passcode: code,
                joined: Date.now()
            };

            staff.push(newStaff);
            save();
            render();
            modal.style.display = 'none';
            form.reset();
        };
    }

    if (searchInput) {
        searchInput.addEventListener('input', render);
    }

    // Initial Render
    render();
});
