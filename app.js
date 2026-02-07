/* =========================================================
   ALMA BELA - app.js (MODULE)
   Firebase Auth (admin) + Firestore (produtos)
   Cloudinary (múltiplas imagens)
   Modal produto (Nike-like) + carrinho + WhatsApp
========================================================= */

/* =========================
   CONFIG
========================= */
const WHATSAPP = "5521979405145";

// >>> TROQUE AQUI (Cloudinary)
const CLOUDINARY_CLOUD_NAME = "SEU_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "SEU_UPLOAD_PRESET";

// Firestore collection
const COLLECTION = "products";

/* =========================
   Firebase imports
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

/* =========================
   Firebase config
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyAMfepLXbYP5oKIZlJ91vDevfbzHEzmoMk",
  authDomain: "almabela.firebaseapp.com",
  projectId: "almabela",
  storageBucket: "almabela.firebasestorage.app",
  messagingSenderId: "304950181664",
  appId: "1:304950181664:web:4f14dfa6dd0fcf9224a145",
  measurementId: "G-2BZDHCSZSQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* =========================
   STATE
========================= */
let adminUser = null;

let produtos = [];
let produtosFiltrados = [];

let carrinho = JSON.parse(localStorage.getItem("almabela_cart")) || [];

let adminImages = []; // URLs (Cloudinary) só no JS, sem textarea

// product viewer modal state
let pvImages = [];
let pvIndex = 0;
let pvProductId = null;

/* =========================
   HELPERS
========================= */
function money(v) {
  const n = Number(v || 0);
  return n.toFixed(2).replace(".", ",");
}
function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function saveCart() {
  localStorage.setItem("almabela_cart", JSON.stringify(carrinho));
  updateBadge();
}
function updateBadge() {
  const badge = document.getElementById("badge");
  if (!badge) return;
  badge.textContent = carrinho.reduce((s, x) => s + (x.qtd || 0), 0);
}
function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}
function setYear() {
  const fy = document.getElementById("footerYear");
  if (fy) fy.textContent = new Date().getFullYear();
}

/* =========================
   ROUTES / VIEW
========================= */
function showView(name, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(name)?.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  if (ev?.target?.classList?.contains("nav-link")) ev.target.classList.add("active");
}

function goToHashRoute() {
  const hash = (location.hash || "").replace("#", "").trim();

  if (hash === "admin") {
    showView("admin");
    if (!adminUser) openLogin();
    return;
  }
  if (hash === "sobre") {
    showView("sobre");
    return;
  }
  showView("colecao");
}

/* =========================
   MODAL CLICK OUTSIDE
========================= */
document.addEventListener("click", (e) => {
  if (e.target.classList?.contains("modal")) e.target.classList.remove("active");
});

/* =========================
   FIRESTORE LISTENER
========================= */
function listenProdutos() {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    produtosFiltrados = [...produtos];

    fillCategories();
    applyFilters();
    renderAdminList();

    const adminCount = document.getElementById("adminCount");
    if (adminCount) adminCount.textContent = `${produtos.length} itens`;
  });
}

/* =========================
   FILTERS
========================= */
function fillCategories() {
  const sel = document.getElementById("catSelect");
  if (!sel) return;

  const current = sel.value;
  const cats = [...new Set(produtos.map(p => (p.categoria || "").trim()).filter(Boolean))].sort();

  sel.innerHTML = `<option value="">Todas as categorias</option>` + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  sel.value = current;
}

function applyFilters() {
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const cat = (document.getElementById("catSelect")?.value || "").trim();

  produtosFiltrados = produtos.filter(p => {
    const okName = !q || (p.nome || "").toLowerCase().includes(q);
    const okCat = !cat || (p.categoria || "") === cat;
    return okName && okCat;
  });

  renderProdutos();
}

/* =========================
   CARD CAROUSEL
========================= */
function renderCarousel(p) {
  const imgs =
    Array.isArray(p.imagens) && p.imagens.length
      ? p.imagens
      : (p.imagemUrl ? [p.imagemUrl] : []);

  if (!imgs.length) {
    return `<div class="carousel"><div style="padding:16px;color:#777;font-weight:800;">Sem imagem</div></div>`;
  }

  const id = `c_${p.id}`;
  return `
    <div class="carousel" id="${id}" data-index="0">
      <div class="carousel-track" style="transform:translateX(0%);">
        ${imgs.map(url => `<img class="carousel-img" src="${url}" alt="">`).join("")}
      </div>

      ${imgs.length > 1 ? `
        <button class="carousel-btn prev" onclick="carouselPrev('${id}'); event.stopPropagation();">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="carousel-btn next" onclick="carouselNext('${id}'); event.stopPropagation();">
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <div class="carousel-dots" onclick="event.stopPropagation();">
          ${imgs.map((_, i) => `<div class="dot ${i===0?'active':''}" onclick="carouselGo('${id}', ${i})"></div>`).join("")}
        </div>
      ` : ""}
    </div>
  `;
}
function carouselGo(id, index) {
  const el = document.getElementById(id);
  if (!el) return;

  const track = el.querySelector(".carousel-track");
  const dots = el.querySelectorAll(".dot");
  el.dataset.index = String(index);

  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
}
function carouselNext(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const total = el.querySelectorAll(".carousel-img").length;
  let idx = Number(el.dataset.index || 0);
  idx = (idx + 1) % total;
  carouselGo(id, idx);
}
function carouselPrev(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const total = el.querySelectorAll(".carousel-img").length;
  let idx = Number(el.dataset.index || 0);
  idx = (idx - 1 + total) % total;
  carouselGo(id, idx);
}

/* =========================
   RENDER PRODUTOS
========================= */
function renderProdutos() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  if (!produtosFiltrados.length) {
    grid.innerHTML = `<div class="box"><p class="muted">Nenhum produto encontrado.</p></div>`;
    return;
  }

  grid.innerHTML = produtosFiltrados.map(p => `
    <article class="product" onclick="openProduct('${p.id}')">
      ${renderCarousel(p)}
      <div class="product-body">
        <div class="product-meta">
          <span class="tag">${escapeHtml(p.categoria || "Lingerie")}</span>
          <span class="price">R$ ${money(p.preco)}</span>
        </div>
        <div class="title">${escapeHtml(p.nome)}</div>
        <button class="btn primary full" onclick="addToCart('${p.id}'); event.stopPropagation();">
          <i class="fa-solid fa-plus"></i> Adicionar
        </button>
      </div>
    </article>
  `).join("");
}

/* =========================
   MODAL PRODUTO (NIKE-LIKE)
========================= */
function openProduct(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  pvImages =
    Array.isArray(p.imagens) && p.imagens.length
      ? p.imagens
      : (p.imagemUrl ? [p.imagemUrl] : []);

  pvIndex = 0;
  pvProductId = p.id;

  document.getElementById("pvTitle").textContent = p.nome || "Produto";
  document.getElementById("pvCat").textContent = p.categoria || "";
  document.getElementById("pvPrice").textContent = `R$ ${money(p.preco)}`;

  const btn = document.getElementById("pvAddBtn");
  btn.onclick = () => {
    addToCart(pvProductId);
    closeModal("productModal");
  };

  renderProductModal();
  openModal("productModal");
}
function renderProductModal() {
  const thumbs = document.getElementById("pvThumbs");
  const main = document.getElementById("pvMainImg");

  if (!pvImages.length) {
    thumbs.innerHTML = "";
    main.src = "";
    return;
  }

  main.src = pvImages[pvIndex];
  thumbs.innerHTML = pvImages.map((url, i) => `
    <div class="pv-thumb ${i===pvIndex?'active':''}" onclick="pvGo(${i})">
      <img src="${url}" alt="">
    </div>
  `).join("");
}
function pvGo(i) { pvIndex = i; renderProductModal(); }
function pvNext() {
  if (!pvImages.length) return;
  pvIndex = (pvIndex + 1) % pvImages.length;
  renderProductModal();
}
function pvPrev() {
  if (!pvImages.length) return;
  pvIndex = (pvIndex - 1 + pvImages.length) % pvImages.length;
  renderProductModal();
}

// swipe (celular)
document.addEventListener("touchstart", (e) => {
  const stage = e.target.closest?.(".pv-stage");
  if (!stage) return;
  stage.dataset.sx = String(e.touches[0].clientX);
}, { passive:true });

document.addEventListener("touchend", (e) => {
  const stage = e.target.closest?.(".pv-stage");
  if (!stage) return;
  const sx = Number(stage.dataset.sx || 0);
  const ex = Number(e.changedTouches[0].clientX);
  const diff = ex - sx;
  if (Math.abs(diff) < 40) return;
  diff < 0 ? pvNext() : pvPrev();
}, { passive:true });

/* =========================
   CART
========================= */
function openCart() {
  renderCart();
  openModal("cartModal");
}
function addToCart(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  const imgPrincipal =
    (Array.isArray(p.imagens) && p.imagens[0]) ? p.imagens[0] :
    (p.imagemUrl ? p.imagemUrl : "");

  const item = carrinho.find(x => x.id === id);
  if (item) item.qtd += 1;
  else carrinho.push({ id: p.id, nome: p.nome, preco: Number(p.preco), imagemUrl: imgPrincipal, qtd: 1 });

  saveCart();
  openCart();
}
function renderCart() {
  const list = document.getElementById("cartList");
  if (!list) return;

  if (!carrinho.length) {
    list.innerHTML = `<div class="empty">Carrinho vazio</div>`;
    return;
  }

  const total = carrinho.reduce((s, x) => s + (x.preco * x.qtd), 0);

  list.innerHTML = `
    <div class="cart-items">
      ${carrinho.map((x, i) => `
        <div class="cart-item">
          <img class="cart-img" src="${x.imagemUrl || ''}" alt="">
          <div style="flex:1">
            <div class="cart-name">${escapeHtml(x.nome)}</div>
            <div class="cart-price">R$ ${money(x.preco)}</div>

            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
              <span class="qty-val">${x.qtd}</span>
              <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
              <button class="remove-btn" onclick="removeCartItem(${i})">Remover</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="cart-summary">
      <div class="summary-line"><span>Subtotal:</span><span class="summary-val">R$ ${money(total)}</span></div>
      <div class="summary-line"><span>Frete:</span><span class="summary-val">A combinar</span></div>
      <div class="summary-line total"><span>Total:</span><span class="summary-val">R$ ${money(total)}</span></div>
    </div>
  `;
}
function updateQty(idx, change) {
  carrinho[idx].qtd += change;
  if (carrinho[idx].qtd <= 0) carrinho.splice(idx, 1);
  saveCart();
  renderCart();
}
function removeCartItem(idx) {
  carrinho.splice(idx, 1);
  saveCart();
  renderCart();
}
function doCheckout() {
  if (!carrinho.length) return;

  let msg = "🛍️ Novo Pedido Alma Bela\n\n";
  carrinho.forEach((x, i) => {
    msg += `${i + 1}. ${x.nome}\nR$ ${money(x.preco)} × ${x.qtd} = R$ ${money(x.preco * x.qtd)}\n\n`;
  });
  const total = carrinho.reduce((s, x) => s + (x.preco * x.qtd), 0);
  msg += `💰 Total: R$ ${money(total)}\n\n✨ Obrigado!`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");

  carrinho = [];
  saveCart();
  closeModal("cartModal");
}

/* =========================
   ADMIN (AUTH)
========================= */
function openLogin() {
  const el = document.getElementById("loginMsg");
  if (el) el.className = "msg";
  openModal("loginModal");
}

async function doLogin(e) {
  e.preventDefault();

  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("passInput").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal("loginModal");
  } catch (err) {
    const el = document.getElementById("loginMsg");
    if (el) {
      el.className = "msg show error";
      el.textContent = "Credenciais inválidas ou sem permissão.";
    }
  }
}

async function adminLogout() {
  await signOut(auth);
  location.hash = "colecao";
  showView("colecao");
}

function renderAdminUI() {
  const locked = document.getElementById("adminLocked");
  const panel = document.getElementById("adminPanel");
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) logoutBtn.style.display = adminUser ? "inline-flex" : "none";

  if (!locked || !panel) return;

  if (!adminUser) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }
  locked.style.display = "block";
  panel.style.display = "block";

  locked.style.display = "none";
}

/* Admin button in header */
onAuthStateChanged(auth, (user) => {
  adminUser = user || null;

  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) adminBtn.style.display = adminUser ? "inline-flex" : "none";

  renderAdminUI();
  renderAdminList();
  goToHashRoute();
});

/* =========================
   ADMIN - CLOUDINARY UPLOAD
========================= */
function abrirUploadCloudinary() {
  if (!adminUser) {
    alert("Faça login para importar fotos.");
    return;
  }
  if (!window.cloudinary) {
    alert("Cloudinary widget não carregou.");
    return;
  }
  if (CLOUDINARY_CLOUD_NAME === "SEU_CLOUD_NAME" || CLOUDINARY_UPLOAD_PRESET === "SEU_UPLOAD_PRESET") {
    alert("Configure CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET no app.js");
    return;
  }

  const widget = cloudinary.createUploadWidget(
    {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      multiple: true,
      sources: ["local", "camera"],
      folder: "almabela",
      maxFiles: 10,
      clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
      showAdvancedOptions: false,
      cropping: false
    },
    (error, result) => {
      if (error) return;
      if (result.event === "success") {
        const url = result.info.secure_url;
        if (url) {
          adminImages.push(url);
          renderAdminPhotos();
        }
      }
    }
  );

  widget.open();
}

function renderAdminPhotos() {
  const grid = document.getElementById("photoGrid");
  if (!grid) return;

  if (!adminImages.length) {
    grid.innerHTML = `<div class="muted">Nenhuma foto adicionada.</div>`;
    return;
  }

  grid.innerHTML = adminImages.map((url, i) => `
    <div class="admin-photo">
      <img src="${url}" alt="">
      <button class="admin-photo-x" onclick="removerFoto(${i})" type="button">×</button>
    </div>
  `).join("");
}

function removerFoto(i) {
  adminImages.splice(i, 1);
  renderAdminPhotos();
}

function limparFotos() {
  adminImages = [];
  renderAdminPhotos();
}

/* =========================
   ADMIN - SAVE PRODUCT
========================= */
async function adminAdicionarProduto() {
  if (!adminUser) {
    alert("Você precisa estar logado.");
    return;
  }

  const nome = document.getElementById("pNome")?.value.trim();
  const categoria = document.getElementById("pCategoria")?.value.trim();
  const preco = Number(document.getElementById("pPreco")?.value || 0);

  if (!nome || !categoria || !preco) {
    alert("Preencha nome, categoria e preço.");
    return;
  }
  if (!adminImages.length) {
    alert("Importe pelo menos 1 foto.");
    return;
  }

  try {
    await addDoc(collection(db, COLLECTION), {
      nome,
      categoria,
      preco,
      imagens: adminImages,
      createdAt: serverTimestamp()
    });

    document.getElementById("pNome").value = "";
    document.getElementById("pCategoria").value = "";
    document.getElementById("pPreco").value = "";

    adminImages = [];
    renderAdminPhotos();

    alert("Produto salvo com sucesso!");
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar. Veja o console.");
  }
}

/* =========================
   ADMIN - LIST / DELETE
========================= */
function renderAdminList() {
  const list = document.getElementById("adminList");
  if (!list) return;

  if (!adminUser) {
    list.innerHTML = "";
    return;
  }

  if (!produtos.length) {
    list.innerHTML = `<div class="muted">Nenhum produto cadastrado.</div>`;
    return;
  }

  list.innerHTML = produtos.map(p => {
    const imgs = Array.isArray(p.imagens) ? p.imagens : [];
    return `
      <div class="admin-item">
        <div class="admin-mini"><img src="${imgs[0] || ''}" alt=""></div>
        <div class="admin-info">
          <div class="admin-name">${escapeHtml(p.nome)}</div>
          <div class="admin-meta">${escapeHtml(p.categoria || '')} • R$ ${money(p.preco)}</div>
        </div>
        <button class="btn danger" onclick="adminExcluir('${p.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join("");
}

async function adminExcluir(id) {
  if (!adminUser) return;
  if (!confirm("Deseja excluir este produto?")) return;

  try {
    await deleteDoc(doc(db, COLLECTION, id));
    alert("Excluído.");
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir. Veja o console.");
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  setYear();
  updateBadge();

  // filtros
  document.getElementById("searchInput")?.addEventListener("input", applyFilters);
  document.getElementById("catSelect")?.addEventListener("change", applyFilters);

  listenProdutos();

  goToHashRoute();
  window.addEventListener("hashchange", goToHashRoute);
  renderAdminPhotos();
});

/* =========================================================
   EXPOSE GLOBALS (onclick em HTML)
========================================================= */
window.showView = showView;

window.openCart = openCart;
window.addToCart = addToCart;
window.updateQty = updateQty;
window.removeCartItem = removeCartItem;
window.doCheckout = doCheckout;

window.openLogin = openLogin;
window.doLogin = doLogin;
window.adminLogout = adminLogout;

window.abrirUploadCloudinary = abrirUploadCloudinary;
window.limparFotos = limparFotos;
window.removerFoto = removerFoto;

window.adminAdicionarProduto = adminAdicionarProduto;
window.adminExcluir = adminExcluir;

window.openProduct = openProduct;
window.pvGo = pvGo;
window.pvNext = pvNext;
window.pvPrev = pvPrev;

window.openModal = openModal;
window.closeModal = closeModal;

window.carouselGo = carouselGo;
window.carouselNext = carouselNext;
window.carouselPrev = carouselPrev;
