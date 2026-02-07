let cart = JSON.parse(localStorage.getItem(CONFIG.cartStorageKey)) || [];

// VIEW
function showView(name, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(name).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  if (ev && ev.target) ev.target.classList.add("active");
}

// RENDER PRODUCTS
function renderProducts() {
  const grid = document.getElementById("grid");

  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}" class="product-image">
      <div class="product-info">
        <div class="product-tag">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">R$ ${p.price.toFixed(2)}</div>

        <div class="size-row">
          <select id="size-${p.id}">
            ${CONFIG.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>

        <button class="btn-add" onclick="addCart(${p.id})">+ Adicionar</button>
      </div>
    </div>
  `).join("");
}

// CART
function addCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const size = document.getElementById(`size-${id}`).value;

  const item = cart.find(x => x.id === id && x.size === size);

  if (item) item.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, size, qty: 1 });

  saveCart();
  openCart();
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

function renderCart() {
  const list = document.getElementById("cartList");

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🛒</div>
        <p>Carrinho vazio</p>
      </div>
    `;
    return;
  }

  const total = cart.reduce((s, x) => s + (x.price * x.qty), 0);

  list.innerHTML = `
    <div class="cart-items">
      ${cart.map((x, i) => `
        <div class="cart-item">
          <img src="${x.img}" class="cart-img" alt="">
          <div class="cart-details">
            <div class="cart-name">${x.name}</div>
            <div class="cart-meta">Tamanho: ${x.size}</div>
            <div class="cart-price">R$ ${x.price.toFixed(2)}</div>

            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
              <span class="qty-val">${x.qty}</span>
              <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
              <button class="remove-btn" onclick="removeCart(${i})">Remover</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="cart-summary">
      <div class="summary-line">
        <span>Subtotal:</span>
        <span class="summary-val">R$ ${total.toFixed(2)}</span>
      </div>

      <div class="summary-line">
        <span>Frete:</span>
        <span class="summary-val">A combinar</span>
      </div>

      <div class="summary-line total">
        <span>Total:</span>
        <span class="summary-val">R$ ${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

function openCart() {
  renderCart();
  document.getElementById("cartModal").classList.add("active");
}

function doCheckout() {
  if (cart.length === 0) return;

  let msg = `🛍️ *Pedido - ${CONFIG.storeName}*\n\n`;

  cart.forEach((x, i) => {
    msg += `${i+1}. ${x.name}\n`;
    msg += `Tamanho: ${x.size}\n`;
    msg += `R$ ${x.price.toFixed(2)} × ${x.qty} = R$ ${(x.price * x.qty).toFixed(2)}\n\n`;
  });

  const total = cart.reduce((s, x) => s + (x.price * x.qty), 0);
  msg += `💰 *Total:* R$ ${total.toFixed(2)}\n\n✨ Obrigado!`;

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");

  cart = [];
  saveCart();
  closeModal("cartModal");
}

// UTILS
function saveCart() {
  localStorage.setItem(CONFIG.cartStorageKey, JSON.stringify(cart));
  updateBadge();
}

function updateBadge() {
  document.getElementById("badge").textContent = cart.reduce((s, x) => s + x.qty, 0);
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

// CLICK FORA FECHA MODAL
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) e.target.classList.remove("active");
});

// INIT
renderProducts();
updateBadge();

// link WhatsApp na aba sobre
const whatsLink = document.getElementById("whatsLink");
if (whatsLink) {
  whatsLink.href = `https://wa.me/${CONFIG.whatsapp}`;
  whatsLink.innerText = `+${CONFIG.whatsapp}`;
}
