// -------------------- PRODUCTS (storage) --------------------
function loadProducts() {
  const saved = localStorage.getItem(CONFIG.STORAGE_PRODUCTS);
  if (saved) return JSON.parse(saved);

  localStorage.setItem(CONFIG.STORAGE_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

function saveProducts(products) {
  localStorage.setItem(CONFIG.STORAGE_PRODUCTS, JSON.stringify(products));
}

// -------------------- CART (storage) --------------------
let cart = JSON.parse(localStorage.getItem(CONFIG.STORAGE_CART)) || [];
let products = loadProducts();
let adminLogged = localStorage.getItem("almabela_admin") === "1";

// -------------------- VIEW --------------------
function showView(name, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(name).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  if (ev && ev.target) ev.target.classList.add("active");

  if (name === "collection") renderProducts();
  if (name === "admin") renderAdmin();
}

// -------------------- RENDER PRODUCTS --------------------
function renderProducts() {
  const grid = document.getElementById("grid");
  products = loadProducts();

  if (!products || products.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:#777;">No products available</p>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" class="product-image">
      <div class="product-info">
        <div class="product-tag">${escapeHtml(p.category || "Lingerie")}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">R$ ${Number(p.price).toFixed(2)}</div>
        <button class="btn-add" onclick="addCart(${p.id})">+ Add</button>
      </div>
    </div>
  `).join("");
}

// -------------------- CART --------------------
function addCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const item = cart.find(x => x.id === id);
  if (item) item.qty++;
  else cart.push({ id: p.id, name: p.name, price: Number(p.price), imageUrl: p.imageUrl, qty: 1 });

  saveCart();
  openCart();
}

function saveCart() {
  localStorage.setItem(CONFIG.STORAGE_CART, JSON.stringify(cart));
  updateBadge();
}

function updateBadge() {
  const badge = document.getElementById("badge");
  if (badge) badge.textContent = cart.reduce((s, x) => s + x.qty, 0);
}

function openCart() {
  renderCart();
  openModal("cartModal");
}

function renderCart() {
  const list = document.getElementById("cartList");

  if (!cart.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🛒</div><p>Your cart is empty</p></div>`;
    return;
  }

  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

  list.innerHTML = `
    <div class="cart-items">
      ${cart.map((x, i) => `
        <div class="cart-item">
          <img src="${x.imageUrl}" class="cart-img" alt="">
          <div class="cart-details">
            <div class="cart-name">${escapeHtml(x.name)}</div>
            <div class="cart-price">R$ ${x.price.toFixed(2)}</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
              <span class="qty-val">${x.qty}</span>
              <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
              <button class="remove-btn" onclick="removeCart(${i})">Remove</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="cart-summary">
      <div class="summary-line"><span>Subtotal:</span><span class="summary-val">R$ ${total.toFixed(2)}</span></div>
      <div class="summary-line"><span>Shipping:</span><span class="summary-val">To be arranged</span></div>
      <div class="summary-line total"><span>Total:</span><span class="summary-val">R$ ${total.toFixed(2)}</span></div>
    </div>
  `;
}

function updateQty(idx, change) {
  cart[idx].qty += change;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function removeCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function doCheckout() {
  if (!cart.length) return;

  let msg = `🛍️ Order - ${CONFIG.STORE_NAME}\n\n`;
  cart.forEach((x, i) => {
    msg += `${i + 1}. ${x.name}\nR$ ${x.price.toFixed(2)} x ${x.qty} = R$ ${(x.price * x.qty).toFixed(2)}\n\n`;
  });

  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  msg += `💰 Total: R$ ${total.toFixed(2)}\n\n✨ Thank you!`;

  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

// -------------------- MODALS --------------------
function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) e.target.classList.remove("active");
});

// -------------------- ADMIN --------------------
function openLogin() {
  const msg = document.getElementById("loginMsg");
  if (msg) msg.className = "msg";
  openModal("loginModal");
}

function doLogin() {
  const email = (document.getElementById("emailInput").value || "").trim();
  const pass = (document.getElementById("passInput").value || "").trim();
  const msg = document.getElementById("loginMsg");

  const ok = (email === CONFIG.ADMIN_EMAIL && pass === CONFIG.ADMIN_PASS);

  if (ok) {
    adminLogged = true;
    localStorage.setItem("almabela_admin", "1");
    closeModal("loginModal");
    renderAdmin();
    showLoginMsg("✅ Logged in!", "success");
  } else {
    showLoginMsg("❌ Invalid credentials", "error");
  }

  function showLoginMsg(text, type) {
    if (!msg) return;
    msg.className = `msg show ${type}`;
    msg.textContent = text;
    setTimeout(() => msg.classList.remove("show"), 2500);
  }
}

function adminLogout() {
  adminLogged = false;
  localStorage.removeItem("almabela_admin");
  renderAdmin();
}

function renderAdmin() {
  const locked = document.getElementById("adminLocked");
  const panel = document.getElementById("adminPanel");
  const list = document.getElementById("adminList");
  if (!locked || !panel || !list) return;

  if (!adminLogged) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }

  locked.style.display = "none";
  panel.style.display = "block";

  products = loadProducts();

  list.innerHTML = products.map(p => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(p.name)}</strong><br/>
        <small>${escapeHtml(p.category || "Lingerie")} • R$ ${Number(p.price).toFixed(2)}</small>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="adminRemoveProduct(${p.id})">Delete</button>
      </div>
    </div>
  `).join("");
}

function adminAddProduct() {
  const name = (document.getElementById("pName").value || "").trim();
  const category = (document.getElementById("pCat").value || "").trim() || "Lingerie";
  const price = Number(document.getElementById("pPrice").value);
  const imageUrl = (document.getElementById("pImg").value || "").trim();

  if (!name || !imageUrl || !Number.isFinite(price) || price <= 0) {
    alert("Please fill Name, Price and Image URL (Cloudinary).");
    return;
  }

  products = loadProducts();
  const newId = products.length ? Math.max(...products.map(x => x.id)) + 1 : 1;

  products.push({ id: newId, name, category, price, imageUrl });
  saveProducts(products);

  document.getElementById("pName").value = "";
  document.getElementById("pCat").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pImg").value = "";

  renderAdmin();
  renderProducts();
}

// OPTIONAL: reset products to defaults
function adminResetProducts() {
  saveProducts(DEFAULT_PRODUCTS);
  renderAdmin();
  renderProducts();
}

function adminRemoveProduct(id) {
  products = loadProducts().filter(p => p.id !== id);
  saveProducts(products);

  // also remove from cart if exists
  cart = cart.filter(x => x.id !== id);
  saveCart();

  renderAdmin();
  renderProducts();
}

// -------------------- CONTACT LINK --------------------
function updateWhatsLink() {
  const el = document.getElementById("whatsLink");
  if (!el) return;
  el.href = `https://wa.me/${CONFIG.WHATSAPP}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// INIT
renderProducts();
updateBadge();
updateWhatsLink();
