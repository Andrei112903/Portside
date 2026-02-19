import './style.css';

// Stocks Data Logic

// Initial Mock Data
const INITIAL_STOCKS = [
    { id: 1, name: 'Ribeye Steak', category: 'Meat', unit: 'kg', quantity: 15.5, price: 25.00, threshold: 5.0 },
    { id: 2, name: 'Salmon Fillet', category: 'Seafood', unit: 'kg', quantity: 8.2, price: 18.50, threshold: 3.0 },
    { id: 3, name: 'Burger Buns', category: 'Dry Goods', unit: 'pcs', quantity: 120, price: 0.50, threshold: 20 },
    { id: 4, name: 'Tomatoes', category: 'Produce', unit: 'kg', quantity: 4.5, price: 3.20, threshold: 2.0 },
    { id: 5, name: 'Coke (Cans)', category: 'Beverages', unit: 'pcs', quantity: 45, price: 0.80, threshold: 10 },
    { id: 6, name: 'Potatoes', category: 'Produce', unit: 'kg', quantity: 25.0, price: 1.50, threshold: 5.0 },
];

// State
let stocks = JSON.parse(localStorage.getItem('inventory')) || INITIAL_STOCKS;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Elements
const tableBody = document.getElementById('stockTableBody');
const modal = document.getElementById('itemModal');
const usageModal = document.getElementById('usageModal');
const form = document.getElementById('stockForm');
const usageForm = document.getElementById('usageForm');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// --- Render ---
function renderTable() {
    const filter = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;
    let grandTotal = 0;

    const filtered = stocks.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(filter);
        const matchesCat = cat === 'all' || item.category === cat;
        return matchesSearch && matchesCat;
    });

    tableBody.innerHTML = filtered.map(item => {
        const isLow = item.quantity <= item.threshold;
        const width = Math.min((item.quantity / (item.threshold * 3)) * 100, 100);
        const itemPrice = parseFloat(item.price) || 0;
        const totalValue = item.quantity * itemPrice;
        grandTotal += totalValue;

        return `
            <tr>
                <td style="font-weight:600">${item.name}</td>
                <td><span class="badge" style="background:rgba(255,255,255,0.05)">${item.category}</span></td>
                <td><span class="badge unit-${item.unit}">${item.unit.toUpperCase()}</span></td>
                <td>
                    <div style="font-size:1.1rem; font-weight:700;">${item.quantity.toFixed(item.unit === 'kg' ? 2 : 0)}</div>
                    <div class="stock-level-bar">
                        <div class="stock-fill ${isLow ? 'low' : ''}" style="width: ${width}%"></div>
                    </div>
                </td>
                <td>₱${itemPrice.toFixed(2)}</td>
                <td style="font-weight:700; color:var(--color-success)">₱${totalValue.toFixed(2)}</td>
                <td>
                    ${isLow
                ? '<span class="badge" style="background:rgba(239,68,68,0.2); color:#ef4444">Low Stock</span>'
                : '<span class="badge success">In Stock</span>'}
                </td>
                <td>
                    <button class="btn-icon" onclick="openUsageModal(${item.id})" title="Record Usage / Deduct" style="background:rgba(239,68,68,0.1); color:var(--color-danger); margin-right:5px;">📉</button>
                    <button class="btn-icon" onclick="editItem(${item.id})" style="background:rgba(56,189,248,0.1); color:var(--color-accent)">✏️</button>
                    <button class="btn-icon" onclick="deleteItem(${item.id})" style="background:rgba(239,68,68,0.1); color:var(--color-danger)">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    // Update Stats
    const totalValueEl = document.getElementById('totalInventoryValue');
    if (totalValueEl) totalValueEl.textContent = `₱${grandTotal.toFixed(2)}`;

    updateDailyExpenses();
}

function updateDailyExpenses() {
    const todayStr = new Date().toLocaleDateString();
    const todayExpenses = expenses.filter(e => new Date(e.date).toLocaleDateString() === todayStr);
    const total = todayExpenses.reduce((sum, e) => sum + e.cost, 0);

    const dailyEl = document.getElementById('dailyExpensesValue');
    if (dailyEl) dailyEl.textContent = `₱${total.toFixed(2)}`;
}

// --- Actions ---

window.openModal = function () {
    form.reset();
    document.getElementById('itemId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Item';
    modal.classList.add('active');
}

window.closeModal = function () {
    modal.classList.remove('active');
}

window.openUsageModal = function (id) {
    const item = stocks.find(i => i.id === id);
    if (!item) return;

    document.getElementById('usageItemId').value = item.id;
    document.getElementById('usageItemName').value = item.name;
    document.getElementById('usageUnitDisplay').textContent = item.unit;
    document.getElementById('usageAmount').value = '';
    document.getElementById('estCostDisplay').textContent = '₱0.00';

    // Live update cost
    const amountInput = document.getElementById('usageAmount');
    amountInput.oninput = () => {
        const val = parseFloat(amountInput.value) || 0;
        const cost = val * item.price;
        document.getElementById('estCostDisplay').textContent = `₱${cost.toFixed(2)}`;
    };

    usageModal.classList.add('active');
}

window.closeUsageModal = function () {
    usageModal.classList.remove('active');
}

window.editItem = function (id) {
    const item = stocks.find(i => i.id === id);
    if (!item) return;

    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.querySelector(`input[name="itemUnit"][value="${item.unit}"]`).checked = true;
    document.getElementById('itemQty').value = item.quantity;
    document.getElementById('itemPrice').value = item.price;

    document.getElementById('modalTitle').textContent = 'Edit Item';
    modal.classList.add('active');
}

window.deleteItem = function (id) {
    if (confirm('Are you sure you want to delete this item?')) {
        stocks = stocks.filter(i => i.id !== id);
        save();
        renderTable();
    }
}

// --- Persistence ---
function save() {
    localStorage.setItem('inventory', JSON.stringify(stocks));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// --- Listeners ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const unit = document.querySelector('input[name="itemUnit"]:checked').value;
    const quantity = parseFloat(document.getElementById('itemQty').value);
    const price = parseFloat(document.getElementById('itemPrice').value) || 0;

    if (id) {
        // Edit
        const index = stocks.findIndex(i => i.id == id);
        if (index > -1) {
            stocks[index] = { ...stocks[index], name, category, unit, quantity, price };
        }
    } else {
        // Add
        const newItem = {
            id: Date.now(),
            name,
            category,
            unit,
            quantity,
            price,
            threshold: 5 // default threshold
        };
        stocks.push(newItem);
    }

    save();
    renderTable();
    closeModal();
});

// Usage Form Listener
if (usageForm) {
    usageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('usageItemId').value;
        const amount = parseFloat(document.getElementById('usageAmount').value);

        if (!amount || amount <= 0) return;

        const index = stocks.findIndex(i => i.id == id);
        if (index > -1) {
            const item = stocks[index];
            const cost = amount * item.price;

            // Deduct Stock
            item.quantity = Math.max(0, item.quantity - amount);
            stocks[index] = item;

            // Record Expense
            expenses.push({
                id: Date.now(),
                itemId: item.id,
                itemName: item.name,
                category: item.category,
                amount: amount,
                unit: item.unit,
                cost: cost,
                date: new Date().toISOString()
            });

            save();
            renderTable();
            closeUsageModal();
        }
    });
}

searchInput.addEventListener('input', renderTable);
categoryFilter.addEventListener('change', renderTable);

// Init
renderTable();

// Listeners for static elements
const btnOpenModal = document.getElementById('btnOpenModal');
if (btnOpenModal) {
    btnOpenModal.addEventListener('click', openModal);
}

// Expose functions globally for dynamic HTML onclick
window.editItem = editItem;
window.deleteItem = deleteItem;
window.closeModal = closeModal;
window.openModal = openModal;
// NEW: Expose usage functions
window.openUsageModal = openUsageModal;
window.closeUsageModal = closeUsageModal;
