import './style.css';

// Default Menu Data (Fallback)
const INITIAL_MENU = {
    starters: [
        { id: 1, name: "Garlic Bread", price: 6.50 },
        { id: 2, name: "Calamari", price: 12.00 },
        { id: 3, name: "Bruschetta", price: 9.50 },
        { id: 4, name: "Wings (6)", price: 10.00 }
    ],
    mains: [
        { id: 11, name: "Portside Burger", price: 18.50 },
        { id: 12, name: "Ribeye Steak", price: 32.00 },
        { id: 13, name: "Fish & Chips", price: 22.00 },
        { id: 14, name: "Caesar Salad", price: 14.50 },
        { id: 15, name: "Pasta Carbonara", price: 19.50 }
    ],
    drinks: [
        { id: 21, name: "Coke", price: 3.50 },
        { id: 22, name: "Beer (Pint)", price: 7.00 },
        { id: 23, name: "House Wine", price: 8.50 },
        { id: 24, name: "Water", price: 0.00 }
    ]
};

// State
let menuData = JSON.parse(localStorage.getItem('menuData')) || INITIAL_MENU;

// Elements
const tableBody = document.getElementById('menuTableBody');
const modal = document.getElementById('itemModal');
const form = document.getElementById('menuForm');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const itemCategorySelect = document.getElementById('itemCategory');

// --- Helpers ---
function getAllItems() {
    let items = [];
    Object.keys(menuData).forEach(cat => {
        menuData[cat].forEach(item => {
            items.push({ ...item, category: cat });
        });
    });
    return items;
}

function getCategories() {
    return Object.keys(menuData);
}

// --- Render ---
function renderTable() {
    const filter = searchInput.value.toLowerCase();
    const catFilter = categoryFilter.value;

    let items = getAllItems();

    const filtered = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(filter);
        const matchesCat = catFilter === 'all' || item.category === catFilter;
        return matchesSearch && matchesCat;
    });

    tableBody.innerHTML = filtered.map(item => `
        <tr>
            <td style="font-weight:600">${item.name}</td>
            <td><span class="badge" style="text-transform:capitalize">${item.category}</span></td>
            <td style="font-weight:700">₱${parseFloat(item.price).toFixed(2)}</td>
            <td>
                <button class="btn-icon" onclick="editItem(${item.id}, '${item.category}')" style="background:rgba(56,189,248,0.1); color:var(--color-accent)">✏️</button>
                <button class="btn-icon" onclick="deleteItem(${item.id}, '${item.category}')" style="background:rgba(239,68,68,0.1); color:var(--color-danger)">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderDropdowns() {
    const categories = getCategories();

    // Filter Dropdown
    const currentFilter = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('');
    categoryFilter.value = currentFilter;

    // Modal Dropdown
    itemCategorySelect.innerHTML = categories.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('');
}

// --- Actions ---

window.addCategory = function () {
    const newCat = prompt("Enter new category name (e.g., 'desserts'):");
    if (newCat) {
        const key = newCat.toLowerCase().trim();
        if (menuData[key]) {
            alert('Category already exists!');
            return;
        }
        menuData[key] = [];
        save();
        renderDropdowns();
        renderTable();
    }
}

window.openModal = function () {
    form.reset();
    document.getElementById('itemId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Menu Item';
    modal.classList.add('active');
}

window.closeModal = function () {
    modal.classList.remove('active');
}

window.editItem = function (id, category) {
    const item = menuData[category].find(i => i.id === id);
    if (!item) return;

    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = category; // This works because we populate options
    document.getElementById('itemPrice').value = item.price;

    document.getElementById('modalTitle').textContent = 'Edit Menu Item';
    modal.classList.add('active');
}

window.deleteItem = function (id, category) {
    if (confirm('Delete this item?')) {
        menuData[category] = menuData[category].filter(i => i.id !== id);
        save();
        renderTable();
    }
}

// --- Persistence ---
function save() {
    localStorage.setItem('menuData', JSON.stringify(menuData));
}

// --- Listeners ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    // If editing, we might need to move categories (delete from old, add to new)
    // For simplicity, we'll brute force: find original and remove, then add to new
    if (id) {
        // Remove from ALL categories first (to handle category change)
        Object.keys(menuData).forEach(cat => {
            menuData[cat] = menuData[cat].filter(i => i.id != id);
        });

        // Add to target category
        menuData[category].push({ id: parseInt(id), name, price });
    } else {
        // New Item
        menuData[category].push({
            id: Date.now(),
            name,
            price
        });
    }

    save();
    renderTable();
    closeModal();
});

searchInput.addEventListener('input', renderTable);
categoryFilter.addEventListener('change', renderTable);

// Init
renderDropdowns();
renderTable();

// Globals for dynamic
window.editItem = editItem;
window.deleteItem = deleteItem;
window.openModal = openModal;
window.closeModal = closeModal;

// Listeners
const btnAddItem = document.getElementById('btnAddItem');
if (btnAddItem) btnAddItem.addEventListener('click', openModal);

const btnAddCategory = document.getElementById('btnAddCategory');
if (btnAddCategory) btnAddCategory.addEventListener('click', addCategory);
