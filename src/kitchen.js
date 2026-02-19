import './style.css';

const grid = document.getElementById('ticket-grid');
const clock = document.getElementById('clock');

// State
let activeOrders = getActiveOrders();

function getActiveOrders() {
    return JSON.parse(localStorage.getItem('activeOrders')) || [];
}

function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Render Tickets
function render() {
    activeOrders = getActiveOrders();

    if (activeOrders.length === 0) {
        grid.innerHTML = '<div style="color:#94a3b8; grid-column:1/-1; text-align:center; font-size:1.5rem; margin-top:3rem;">No pending orders</div>';
        return;
    }

    // Sort by timestamp (Oldest first)
    activeOrders.sort((a, b) => a.timestamp - b.timestamp);

    grid.innerHTML = activeOrders.map(order => {
        const elapsedMinutes = Math.floor((Date.now() - order.timestamp) / 60000);
        const isLate = elapsedMinutes > 15;

        // Group items
        const itemsMap = {};
        order.items.forEach(item => {
            if (itemsMap[item.name]) itemsMap[item.name]++;
            else itemsMap[item.name] = 1;
        });

        const itemsHTML = Object.entries(itemsMap).map(([name, qty]) => `
            <div class="ticket-item">
                <div style="display:flex; align-items:center;">
                    <span class="qty">${qty}</span>
                    <span>${name}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="ticket-card ${isLate ? 'high-priority' : ''}">
                <div class="ticket-header">
                    <span>Order #${order.id}</span>
                    <span style="color:${isLate ? '#ef4444' : '#64748b'}">${elapsedMinutes}m ago</span>
                </div>
                <div class="ticket-body">
                    ${itemsHTML}
                </div>
                <div class="ticket-footer">
                    <button class="btn-complete" onclick="completeOrder(${order.timestamp})">✅ Ready</button>
                    ${isLate ? '<div style="color:red; font-size:0.8rem; margin-top:5px; font-weight:bold;">LATE!</div>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Actions
window.completeOrder = function (timestamp) {
    // 1. Remove from active
    let orders = getActiveOrders();
    // Filter by unique timestamp
    orders = orders.filter(o => o.timestamp !== timestamp);

    // 2. Save
    localStorage.setItem('activeOrders', JSON.stringify(orders));

    // 3. Re-render
    render();
}


// Init
setInterval(updateClock, 1000);
updateClock();
render();

// Poll for new orders every 3 seconds
setInterval(render, 3000);

// Global
window.completeOrder = completeOrder;
