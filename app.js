// ---------- Helpers ----------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- Produtos (storage) ----------
function carregarProdutos() {
  const key = CONFIG.STORAGE_PRODUTOS;
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);

  const seed = window.DEFAULT_PRODUCTS || [];
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function salvarProdutos(produtos) {
  localStorage.setItem(CONFIG.STORAGE_PRODUTOS, JSON.stringify(produtos));
}

// ---------- Carrinho ----------
let carrinho = JSON.parse(localStorage.getItem(CONFIG.STORAGE_CARRINHO)) || [];
let produtos = [];
let adminLogado = localStorage.getItem(CONFIG.STORAGE_ADMIN) === "1";

// ---------- Menu mobile ----------
function toggleMenu() {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.toggle("open");
}
function fecharMenu() {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.remove("open");
}

// ---------- Views ----------
function showView(nome, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(nome);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  if (ev && ev.target && ev.target.classList.contains("nav-link")) ev.target.classList.add("active");

  fecharMenu();

  if (nome === "colecao") renderizarProdutos();
  if (nome === "admin") renderizarAdmin();
}

// ---------- Render Produtos ----------
function renderizarProdutos() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  produtos = carregarProdutos();

  if (!produtos || produtos.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:#777;">Nenhum produto cadastrado</p>`;
    return;
  }

  grid.innerHTML = produtos.map(p => `
    <div class="product-card">
      <img src="${p.imagemUrl}" alt="${escapeHtml(p.nome)}" class="product-image">
      <div class="product-info">
        <div class="product-tag">${escapeHtml(p.categoria || "Lingerie")}</div>
        <div class="product-name">${escapeHtml(p.nome)}</div>
        <div class="product-price">R$ ${Number(p.preco).toFixed(2)}</div>
        <button class="btn-add" onclick="adicionarAoCarrinho(${p.id})">+ Adicionar</button>
      </div>
    </div>
  `).join("");
}

// ---------- Carrinho UI ----------
function salvarCarrinho() {
  localStorage.setItem(CONFIG.STORAGE_CARRINHO, JSON.stringify(carrinho));
  atualizarBadge();
}

function atualizarBadge() {
  const badge = document.getElementById("badge");
  if (badge) badge.textContent = carrinho.reduce((s, x) => s + x.qtd, 0);
}

function adicionarAoCarrinho(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  const item = carrinho.find(x => x.id === id);
  if (item) item.qtd++;
  else carrinho.push({ id: p.id, nome: p.nome, preco: Number(p.preco), imagemUrl: p.imagemUrl, qtd: 1 });

  salvarCarrinho();
  openCart();
}

function openCart() {
  renderizarCarrinho();
  openModal("cartModal");
}

function renderizarCarrinho() {
  const list = document.getElementById("cartList");
  if (!list) return;

  if (!carrinho.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🛒</div><p>Seu carrinho está vazio</p></div>`;
    return;
  }

  const total = carrinho.reduce((s, x) => s + x.preco * x.qtd, 0);

  list.innerHTML = `
    <div class="cart-items">
      ${carrinho.map((x, i) => `
        <div class="cart-item">
          <img src="${x.imagemUrl}" class="cart-img" alt="">
          <div class="cart-details">
            <div class="cart-name">${escapeHtml(x.nome)}</div>
            <div class="cart-price">R$ ${x.preco.toFixed(2)}</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="mudarQtd(${i}, -1)">−</button>
              <span class="qty-val">${x.qtd}</span>
              <button class="qty-btn" onclick="mudarQtd(${i}, 1)">+</button>
              <button class="remove-btn" onclick="removerItem(${i})">Remover</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="cart-summary">
      <div class="summary-line"><span>Subtotal:</span><span class="summary-val">R$ ${total.toFixed(2)}</span></div>
      <div class="summary-line"><span>Frete:</span><span class="summary-val">A combinar</span></div>
      <div class="summary-line total"><span>Total:</span><span class="summary-val">R$ ${total.toFixed(2)}</span></div>
    </div>
  `;
}

function mudarQtd(idx, change) {
  carrinho[idx].qtd += change;
  if (carrinho[idx].qtd <= 0) carrinho.splice(idx, 1);
  salvarCarrinho();
  renderizarCarrinho();
}

function removerItem(idx) {
  carrinho.splice(idx, 1);
  salvarCarrinho();
  renderizarCarrinho();
}

function finalizarWhatsApp() {
  if (!carrinho.length) return;

  let msg = `🛍️ Pedido - ${CONFIG.NOME_LOJA}\n\n`;
  carrinho.forEach((x, i) => {
    msg += `${i + 1}. ${x.nome}\nR$ ${x.preco.toFixed(2)} x ${x.qtd} = R$ ${(x.preco * x.qtd).toFixed(2)}\n\n`;
  });

  const total = carrinho.reduce((s, x) => s + x.preco * x.qtd, 0);
  msg += `💰 Total: R$ ${total.toFixed(2)}\n\n✨ Obrigado!`;

  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ---------- Modais ----------
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) e.target.classList.remove("active");
});

// ---------- Admin (escondido) ----------
function openLogin() {
  const msg = document.getElementById("loginMsg");
  if (msg) msg.className = "msg";
  openModal("loginModal");
}

function adminLogin() {
  const email = (document.getElementById("emailInput").value || "").trim();
  const senha = (document.getElementById("passInput").value || "").trim();
  const msg = document.getElementById("loginMsg");

  const ok = (email === CONFIG.ADMIN_EMAIL && senha === CONFIG.ADMIN_SENHA);

  if (ok) {
    adminLogado = true;
    localStorage.setItem(CONFIG.STORAGE_ADMIN, "1");
    closeModal("loginModal");
    renderizarAdmin();
  } else {
    if (msg) {
      msg.className = "msg show error";
      msg.textContent = "❌ Login inválido";
      setTimeout(() => msg.classList.remove("show"), 2500);
    }
  }
}

function adminSair() {
  adminLogado = false;
  localStorage.removeItem(CONFIG.STORAGE_ADMIN);
  renderizarAdmin();
}

function renderizarAdmin() {
  const locked = document.getElementById("adminLocked");
  const panel = document.getElementById("adminPanel");
  const list = document.getElementById("adminList");
  if (!locked || !panel || !list) return;

  if (!adminLogado) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }

  locked.style.display = "none";
  panel.style.display = "block";

  produtos = carregarProdutos();

  list.innerHTML = produtos.map(p => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(p.nome)}</strong><br/>
        <small>${escapeHtml(p.categoria || "Lingerie")} • R$ ${Number(p.preco).toFixed(2)}</small>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="adminRemoverProduto(${p.id})">Excluir</button>
      </div>
    </div>
  `).join("");
}

function adminAdicionarProduto() {
  const nome = (document.getElementById("pNome").value || "").trim();
  const categoria = (document.getElementById("pCategoria").value || "").trim() || "Lingerie";
  const preco = Number(document.getElementById("pPreco").value);
  const imagemUrl = (document.getElementById("pImagem").value || "").trim();

  if (!nome || !imagemUrl || !Number.isFinite(preco) || preco <= 0) {
    alert("Preencha Nome, Preço e a URL da imagem (Cloudinary).");
    return;
  }

  produtos = carregarProdutos();
  const newId = produtos.length ? Math.max(...produtos.map(x => x.id)) + 1 : 1;

  produtos.push({ id: newId, nome, categoria, preco, imagemUrl });
  salvarProdutos(produtos);

  document.getElementById("pNome").value = "";
  document.getElementById("pCategoria").value = "";
  document.getElementById("pPreco").value = "";
  document.getElementById("pImagem").value = "";

  renderizarAdmin();
  renderizarProdutos();
}

function adminRemoverProduto(id) {
  produtos = carregarProdutos().filter(p => p.id !== id);
  salvarProdutos(produtos);

  carrinho = carrinho.filter(x => x.id !== id);
  salvarCarrinho();

  renderizarAdmin();
  renderizarProdutos();
}

// Admin escondido por hash: /#admin
function checarHashAdmin() {
  const hash = (location.hash || "").replace("#", "");
  if (hash === "admin") showView("admin");
}
window.addEventListener("hashchange", checarHashAdmin);

// Whats link
function updateWhatsLink() {
  const el = document.getElementById("whatsLink");
  if (!el) return;
  el.href = `https://wa.me/${CONFIG.WHATSAPP}`;
  el.textContent = `+${CONFIG.WHATSAPP}`;
}

// ---------- INIT garantido ----------
document.addEventListener("DOMContentLoaded", () => {
  try {
    produtos = carregarProdutos();
    renderizarProdutos();
    atualizarBadge();
    updateWhatsLink();
    checarHashAdmin();
  } catch (e) {
    const grid = document.getElementById("grid");
    if (grid) grid.innerHTML = `<p style="text-align:center;color:#c0392b;font-weight:700;">Erro ao carregar produtos. Verifique products.js e a ordem dos scripts.</p>`;
  }
});
