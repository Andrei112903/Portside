import './style.css';

const tableBody = document.getElementById('salesTableBody');
const dateFilter = document.getElementById('dateFilter');

// Metrics Elements
const revEl = document.getElementById('totalRevenue');
const expEl = document.getElementById('totalExpenses');
const profitEl = document.getElementById('netProfit');
const topEl = document.getElementById('topItem');

// State
let sales = getSalesHistory();
let expenses = getExpenses();

function getSalesHistory() {
    return JSON.parse(localStorage.getItem('salesHistory')) || [];
}

function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

// Set Date Filter to Today
dateFilter.valueAsDate = new Date();

function render() {
    sales = getSalesHistory();
    expenses = getExpenses();
    const filterDateStr = new Date(dateFilter.value).toLocaleDateString();

    // Filter Sales by Date
    const filteredSales = sales.filter(s => {
        const sDate = new Date(s.timestamp).toLocaleDateString();
        return sDate === filterDateStr;
    });

    // Filter Expenses by Date
    const filteredExpenses = expenses.filter(e => {
        const eDate = new Date(e.date).toLocaleDateString();
        return eDate === filterDateStr;
    });

    // Sort: Newest first
    filteredSales.sort((a, b) => b.timestamp - a.timestamp);

    // Calc Metrics
    const totalRev = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalExp = filteredExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const netProfit = totalRev - totalExp;

    // Calc Lifetime Profit
    const allTimeRev = sales.reduce((sum, s) => sum + s.total, 0);
    const allTimeExp = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const lifetimeProfit = allTimeRev - allTimeExp;

    // Find Top Item (Filtered)
    const itemCounts = {};
    filteredSales.forEach(s => {
        s.items.forEach(i => {
            itemCounts[i.name] = (itemCounts[i.name] || 0) + 1;
        });
    });
    let topItemName = '-';
    let maxCount = 0;
    Object.entries(itemCounts).forEach(([name, qty]) => {
        if (qty > maxCount) {
            maxCount = qty;
            topItemName = name;
        }
    });

    // Update UI Metrics
    if (revEl) revEl.textContent = `₱${totalRev.toFixed(2)}`;
    if (expEl) expEl.textContent = `₱${totalExp.toFixed(2)}`;

    if (profitEl) {
        profitEl.textContent = `₱${netProfit.toFixed(2)}`;
        profitEl.style.color = netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    }

    if (topEl) topEl.textContent = topItemName + (maxCount > 0 ? ` (${maxCount})` : '');

    // Render Table
    if (tableBody) {
        if (filteredSales.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:gray">No sales recorded for this date.</td></tr>';
        } else {
            tableBody.innerHTML = filteredSales.map(s => {
                const itemNames = s.items.map(i => i.name).join(', ');
                return `
                    <tr>
                        <td>#${s.id}</td>
                        <td>${new Date(s.timestamp).toLocaleTimeString()}</td>
                        <td><div style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${itemNames}</div></td>
                        <td style="font-weight:700;">₱${s.total.toFixed(2)}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}

dateFilter.addEventListener('change', render);

// Refresh periodically
setInterval(render, 5000);

render();
