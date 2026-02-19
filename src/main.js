import './style.css'

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
let MENU = JSON.parse(localStorage.getItem('menuData')) || INITIAL_MENU;
// If nothing in localstorage, save initial so menu page sees it
if (!localStorage.getItem('menuData')) {
  localStorage.setItem('menuData', JSON.stringify(INITIAL_MENU));
}

let state = {
  cart: [],
  currentCategory: Object.keys(MENU)[0] || 'starters',
  orderNumber: 101
};

// DOM Elements
const app = document.querySelector('#app');

// --- Render Logic ---

function renderApp() {
  if (!app) return; // Not on the main page

  // Dynamic Tabs
  const categories = Object.keys(MENU);
  const tabsHTML = categories.map(cat =>
    `<button class="cat-tab ${state.currentCategory === cat ? 'active' : ''}" data-cat="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`
  ).join('');

  const currentUser = localStorage.getItem('currentUser') || 'Server';

  app.innerHTML = `
    <div class="pos-layout">
      <header class="pos-header">
        <div class="brand">PortSide Grill POS</div>
        <div class="server-info">
          <span>Server: ${currentUser}</span>
          <span>Order #<input type="text" id="order-num-input" value="${state.orderNumber}" style="width:80px; padding:0.25rem; border-radius:0.25rem; border:none; margin-left:0.25rem; font-weight:bold; text-align:center; color:#1e293b;"></span>
          <button class="btn-primary" onclick="window.location.href='/login.html'">Logout</button>
        </div>
      </header>

      <div class="menu-area">
        <div class="category-tabs">
          ${tabsHTML}
        </div>
        <div class="menu-grid" id="menu-grid">
          <!-- Items injected here -->
        </div>
      </div>

      <aside class="order-sidebar">
        <div class="order-header">
          <span>Current Order</span>
          <span id="item-count">0 items</span>
        </div>
        <div class="order-list" id="order-list">
          <!-- Cart items injected here -->
        </div>
        <div class="order-totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span id="subtotal">₱0.00</span>
          </div>
          <div class="total-row">
            <span>Tax (10%)</span>
            <span id="tax">₱0.00</span>
          </div>
          <div class="total-row final">
            <span>Total</span>
            <span id="total">₱0.00</span>
          </div>
          <div class="action-buttons">
            <button class="btn-danger" id="cancel-btn">Cancel</button>
            <button class="btn-success" id="pay-btn">PAY</button>
          </div>
        </div>
      </aside>
    </div>
  `;

  attachEventListeners();
  renderMenu();
  renderCart();

  // Listen for manual order changes
  const numInput = document.getElementById('order-num-input');
  if (numInput) {
    numInput.addEventListener('change', (e) => {
      state.orderNumber = e.target.value;
    });
  }
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  const items = MENU[state.currentCategory] || [];

  if (items.length === 0) {
    grid.innerHTML = '<div style="color:white; padding:2rem;">No items in this category.</div>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="menu-item" data-id="${item.id}" onclick="addToCart(${item.id})">
      <div class="item-name">${item.name}</div>
      <div class="item-price">₱${item.price.toFixed(2)}</div>
    </div>
  `).join('');
}

function renderCart() {
  const list = document.getElementById('order-list');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const countEl = document.getElementById('item-count');

  if (!list) return;

  // Load Settings
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { tax: 10, currency: '₱' };
  const currency = settings.currency;
  const taxRate = settings.tax / 100;

  list.innerHTML = state.cart.map((item, index) => `
    <div class="order-item">
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-price">${currency}${item.price.toFixed(2)}</div>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  subtotalEl.textContent = `${currency}${subtotal.toFixed(2)}`;
  taxEl.textContent = `${currency}${tax.toFixed(2)}`;
  totalEl.textContent = `${currency}${total.toFixed(2)}`;
  countEl.textContent = `${state.cart.length} items`;
}

// --- Actions ---

window.addToCart = function (id) {
  // Find item across all categories
  let item = null;
  Object.values(MENU).forEach(catItems => {
    const found = catItems.find(i => i.id === id);
    if (found) item = found;
  });

  if (item) {
    state.cart.push(item);
    renderCart();
  }
}

window.removeFromCart = function (index) {
  state.cart.splice(index, 1);
  renderCart();
}

function attachEventListeners() {
  // Tabs
  document.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.currentCategory = e.target.dataset.cat;
      // Update UI
      document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderMenu();
    });
  });

  // Pay / Cancel
  const payBtn = document.getElementById('pay-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  if (payBtn) payBtn.addEventListener('click', processPayment);
  if (cancelBtn) cancelBtn.addEventListener('click', () => {
    if (confirm('Clear order?')) {
      state.cart = [];
      renderCart();
    }
  });
}

function processPayment() {
  if (state.cart.length === 0) return alert("Order is empty!");

  // Get Manual Order Number
  const numInput = document.getElementById('order-num-input');
  const orderId = numInput ? numInput.value : state.orderNumber;
  const currentUser = localStorage.getItem('currentUser') || 'Server';

  // Create Order Object
  const newOrder = {
    id: orderId,
    items: state.cart, // array of items
    total: parseFloat(document.getElementById('total').textContent.replace('₱', '').replace(/,/g, '')),
    timestamp: Date.now(),
    status: 'pending',
    server: currentUser
  };

  // Save to Active Orders (for Kitchen)
  const activeOrders = JSON.parse(localStorage.getItem('activeOrders')) || [];
  activeOrders.push(newOrder);
  localStorage.setItem('activeOrders', JSON.stringify(activeOrders));

  // Save to Sales History (for Reports)
  const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
  salesHistory.push(newOrder);
  localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

  alert(`Order #${orderId} Sent to Kitchen!`);

  state.cart = [];

  if (!isNaN(orderId)) {
    state.orderNumber = parseInt(orderId) + 1;
  }

  if (numInput) numInput.value = state.orderNumber;

  renderCart();
}

// --- Init Logic ---

function init() {
  // Clear session if on Login Page
  if (window.location.pathname.includes('login.html')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('role');
  }

  // Auth Guard for Protected Pages
  const protectedPages = ['dashboard.html', 'staff.html', 'stocks.html', 'reports.html', 'menu.html', 'expenses.html', 'kitchen.html'];
  const isProtected = protectedPages.some(page => window.location.pathname.includes(page));

  if (isProtected) {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      window.location.href = '/login.html';
      return;
    }
  }

  // 0. Check for Register Form
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const username = document.getElementById('reg-username').value;
      const pass = document.getElementById('reg-pass').value;
      const role = document.getElementById('reg-role').value;

      const staff = JSON.parse(localStorage.getItem('staffData')) || [];

      if (staff.some(s => s.username === username)) {
        alert('Username already taken!');
        return;
      }

      const newUser = {
        id: Date.now(),
        name,
        username,
        passcode: pass,
        role,
        joined: Date.now()
      };

      staff.push(newUser);
      localStorage.setItem('staffData', JSON.stringify(staff));

      alert('Account created! Please login.');
      window.location.href = '/login.html';
    });
    return;
  }

  // 1. Check for Login Form (Login Page)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const pass = document.getElementById('password').value;

      // Admin Override (Dynamic)
      const adminConfig = JSON.parse(localStorage.getItem('adminConfig')) || { user: 'admin', pass: 'admin123' };

      if (username.toLowerCase() === adminConfig.user.toLowerCase() && pass === adminConfig.pass) {
        localStorage.setItem('role', 'admin');
        localStorage.setItem('currentUser', 'Admin');
        window.location.href = '/dashboard.html';
        return;
      }

      // Check Staff Data
      const staff = JSON.parse(localStorage.getItem('staffData')) || [];
      const user = staff.find(s => s.username === username && s.passcode === pass);

      if (user) {
        localStorage.setItem('role', user.role);
        localStorage.setItem('currentUser', user.name);

        if (user.role === 'Manager') {
          window.location.href = '/dashboard.html';
        } else if (user.role === 'Kitchen') {
          window.location.href = '/kitchen.html';
        } else {
          window.location.href = '/';
        }
      } else {
        alert('Invalid credentials!');
      }
    });
    return;
  }

  // 3. Dashboard Logic
  // Check for admin app wrappers
  if (document.getElementById('dashboard-app') ||
    document.getElementById('stock-app') ||
    document.getElementById('menu-app') ||
    document.getElementById('kitchen-grid') ||
    document.getElementById('reports-app') ||
    document.getElementById('staff-app')) {
    return;
  }

  // 4. POS Logic (Main Page)
  renderApp();
}

// Run (with small delay if needed or immediately)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose globals
window.init = init;
