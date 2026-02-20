import './style.css';
// Import removed, handled by explicit script tag in HTML
// import { init } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    console.log('Initializing Dashboard Metrics...');

    // 1. Get Data
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const staffData = JSON.parse(localStorage.getItem('staffData')) || [];

    // 2. Calculate Dates
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - (24 * 60 * 60 * 1000);

    // 3. Filter Orders
    const todayOrders = salesHistory.filter(o => o.timestamp >= startOfToday);
    const yesterdayOrders = salesHistory.filter(o => o.timestamp >= startOfYesterday && o.timestamp < startOfToday);

    // 4. Calculate Metrics

    // Sales
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Staff
    const totalStaff = staffData.length;

    // Top Item
    const itemCounts = {};
    todayOrders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + 1; // Assuming simple items array
            });
        }
    });

    let topItemName = "None";
    let topItemCount = 0;

    Object.entries(itemCounts).forEach(([name, count]) => {
        if (count > topItemCount) {
            topItemName = name;
            topItemCount = count;
        }
    });

    // 5. Render Metrics

    // Sales Logic
    const salesEl = document.getElementById('dailySales');
    if (salesEl) salesEl.textContent = `₱${todaySales.toFixed(2)}`;

    const salesTrendEl = document.getElementById('salesTrend');
    if (salesTrendEl) {
        if (yesterdaySales > 0) {
            const growth = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
            const sign = growth >= 0 ? '▲' : '▼';
            const color = growth >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
            salesTrendEl.innerHTML = `<span style="color:${color}">${sign} ${Math.abs(growth).toFixed(0)}% vs yesterday</span>`;
        } else {
            salesTrendEl.textContent = "No data for yesterday";
        }
    }

    // Orders Logic
    const ordersEl = document.getElementById('dailyOrders');
    if (ordersEl) ordersEl.textContent = todayOrders.length;

    const ordersTrendEl = document.getElementById('ordersTrend');
    if (ordersTrendEl) {
        const yCount = yesterdayOrders.length;
        if (yCount > 0) {
            const growth = ((todayOrders.length - yCount) / yCount) * 100;
            const sign = growth >= 0 ? '▲' : '▼';
            const color = growth >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
            ordersTrendEl.innerHTML = `<span style="color:${color}">${sign} ${Math.abs(growth).toFixed(0)}% vs yesterday</span>`;
        } else {
            ordersTrendEl.textContent = "No data for yesterday";
        }
    }

    // Staff Logic
    const staffEl = document.getElementById('totalStaff');
    if (staffEl) staffEl.textContent = totalStaff;

    // Top Item Logic
    const topItemEl = document.getElementById('topItem');
    const topItemCountEl = document.getElementById('topItemCount');
    if (topItemEl) topItemEl.textContent = topItemName;
    if (topItemCountEl) topItemCountEl.textContent = `${topItemCount} orders today`;


    // 6. Recent Orders Table
    const tableBody = document.getElementById('recentOrdersBody');
    if (tableBody) {
        // Sort newest first, take top 10
        const recent = [...salesHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        if (recent.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--color-text-secondary);">No recent orders found.</td></tr>';
        } else {
            tableBody.innerHTML = recent.map(order => {
                const date = new Date(order.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${timeStr}</td>
                        <td>${order.server || 'Unknown'}</td>
                        <td style="font-weight:bold;">₱${(order.total || 0).toFixed(2)}</td>
                        <td><span class="status-badge success">Paid</span></td>
                    </tr>
                `;
            }).join('');
        }
    }
}
