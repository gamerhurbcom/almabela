/* =========================================================
   ALMA BELA - APP.JS COMPLETO
   Firebase Firestore (produtos) + Cloudinary (imagens)
   Modal Produto + Carrossel + Admin escondido por #admin
========================================================= */

/* =========================
   CONFIGS
========================= */

// WhatsApp do pedido
const WHATSAPP = "5521979405145";

// Cloudinary
const CLOUDINARY_CLOUD_NAME = "SEU_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "SEU_UPLOAD_PRESET";

// Coleção Firestore
const COLLECTION = "products";

/* =========================
   FIREBASE
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
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
   ESTADOS
========================= */

let produtos = [];
let produtosFiltrados = [];

let carrinho = JSON.parse(localStorage.getItem("almabela_cart")) || [];

let adminUser = null;

// Modal Produto
let pvImages = [];
let pvIndex = 0;
let pvProductId = null;

// Admin imagens temporárias (não mostra URL)
let adminImages = [];

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

/* =========================
   VIEW / ROUTE
========================= */

window.showView = function showView(name, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const sec = document.getElementById(name);
  if (sec) sec.classList.add("active");

  // ativa menu se tiver
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  if (ev?.target?.classList?.contains("nav-link")) ev.target.classList.add("active");
};

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
   MODAIS
========================= */

window.openModal = function openModal(id) {
  document.getElementById(id)?.classList.add("active");
};

window.closeModal = function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
};

// Fecha clicando fora
document.addEventListener("click", (e) => {
  if (e.target.classList?.contains("modal")) e.target.classList.remove("active");
});

/* =========================
   PRODUTOS (FIRESTORE)
========================= */

function listenProdutos() {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // filtro padrão
    produtosFiltrados = [...produtos];

    renderProdutos();
    renderAdminList();

    const adminCount = document.getElementById("adminCount");
    if (adminCount) adminCount.textContent = `${produtos.length} itens`;
  });
}

/* =========================
   CARROSSEL (CARD)
========================= */

function renderCarousel(p) {
  const imgs =
    Array.isArray(p.imagens) && p.imagens.length
      ? p.imagens
      : (p.imagemUrl ? [p.imagemUrl] : []);

  if (!imgs.length) {
    return `
      <div class="carousel">
        <div style="padding:16px;color:#777;font-weight:700;">Sem imagem</div>
      </div>
    `;
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
          ${imgs.map((_, i) => `<div class="dot ${i === 0 ? "active" : ""}" onclick="carouselGo('${id}', ${i})"></div>`).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

window.carouselGo = function carouselGo(id, index) {
  const el = document.getElementById(id);
  if (!el) return;

  const track = el.querySelector(".carousel-track");
  const dots = el.querySelectorAll(".dot");

  el.dataset.index = String(index);
  track.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach((d, i) => d.classList.toggle("active", i === index));
};

window.carouselNext = function carouselNext(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const track = el.querySelector(".carousel-track");
  const imgs = track.querySelectorAll(".carousel-img");
  const total = imgs.length;

  let idx = Number(el.dataset.index || 0);
  idx = (idx + 1) % total;
  carouselGo(id, idx);
};

window.carouselPrev = function carouselPrev(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const track = el.querySelector(".carousel-track");
  const imgs = track.querySelectorAll(".carousel-img");
  const total = imgs.length;

  let idx = Number(el.dataset.index || 0);
  idx = (idx - 1 + total) % total;
  carouselGo(id, idx);
};

/* =========================
   RENDER PRODUTOS (CATÁLOGO)
========================= */

function renderProdutos() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const list = produtosFiltrados;

  if (!list.length) {
    grid.innerHTML = `<div class="box"><p>Nenhum produto encontrado.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="product" onclick="openProduct('${p.id}')">
      ${renderCarousel(p)}

      <div class="product-body" onclick="event.stopPropagation()">
        <div class="product-meta">
          <span class="tag">${escapeHtml(p.categoria || "Lingerie")}</span>
          <span class="price">R$ ${money(p.preco)}</span>
        </div>

        <div class="title">${escapeHtml(p.nome)}</div>

        <button class="btn primary full" onclick="addToCart('${p.id}')">
          Adicionar
        </button>
      </div>
    </article>
  `).join("");
}

/* =========================
   MODAL PRODUTO (VISUALIZAÇÃO)
========================= */

window.openProduct = function openProduct(id) {
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
};

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
    <div class="pv-thumb ${i === pvIndex ? "active" : ""}" onclick="pvGo(${i})">
      <img src="${url}" alt="">
    </div>
  `).join("");
}

window.pvGo = function pvGo(i) {
  pvIndex = i;
  renderProductModal();
};

window.pvNext = function pvNext() {
  if (!pvImages.length) return;
  pvIndex = (pvIndex + 1) % pvImages.length;
  renderProductModal();
};

window.pvPrev = function pvPrev() {
  if (!pvImages.length) return;
  pvIndex = (pvIndex - 1 + pvImages.length) % pvImages.length;
  renderProductModal();
};

// Swipe no modal (celular)
document.addEventListener("touchstart", (e) => {
  const stage = e.target.closest?.(".pv-stage");
  if (!stage) return;
  stage.dataset.sx = String(e.touches[0].clientX);
}, { passive: true });

document.addEventListener("touchend", (e) => {
  const stage = e.target.closest?.(".pv-stage");
  if (!stage) return;

  const sx = Number(stage.dataset.sx || 0);
  const ex = Number(e.changedTouches[0].clientX);
  const diff = ex - sx;

  if (Math.abs(diff) < 40) return;
  if (diff < 0) pvNext();
  else pvPrev();
}, { passive: true });

/* =========================
   CARRINHO
========================= */

window.addToCart = function addToCart(id) {
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
};

window.openCart = function openCart() {
  renderCart();
  openModal("cartModal");
};

function renderCart() {
  const list = document.getElementById("cartList");
  if (!list) return;

  if (!carrinho.length) {
    list.innerHTML = `<div class="empty"><p>Carrinho vazio</p></div>`;
    return;
  }

  const total = carrinho.reduce((s, x) => s + (x.preco * x.qtd), 0);

  list.innerHTML = `
    <div class="cart-items">
      ${carrinho.map((x, i) => `
        <div class="cart-item">
          <img src="${x.imagemUrl || ""}" class="cart-img" alt="">
          <div class="cart-details">
            <div class="cart-name">${escapeHtml(x.nome)}</div>
            <div class="cart-price">R$ ${money(x.preco)}</div>

            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
              <span class="qty-val">${x.qtd}</span>
              <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
              <button class="remove-btn" onclick="removeCart(${i})">Remover</button>
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

window.updateQty = function updateQty(idx, change) {
  carrinho[idx].qtd += change;
  if (carrinho[idx].qtd <= 0) carrinho.splice(idx, 1);
  saveCart();
  renderCart();
};

window.removeCart = function removeCart(idx) {
  carrinho.splice(idx, 1);
  saveCart();
  renderCart();
};

window.doCheckout = function doCheckout() {
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
};

/* =========================
   ADMIN LOGIN + PAINEL
========================= */

window.openLogin = function openLogin() {
  openModal("loginModal");
};

window.doLogin = async function doLogin(e) {
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
      el.textContent = "Credenciais inválidas ou acesso bloqueado.";
    }
  }
};

window.adminSair = async function adminSair() {
  await signOut(auth);
  location.hash = "";
  showView("colecao");
};

function renderAdmin() {
  const locked = document.getElementById("adminLocked");
  const panel = document.getElementById("adminPanel");

  if (!locked || !panel) return;

  if (!adminUser) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }

  locked.style.display = "none";
  panel.style.display = "block";
}

onAuthStateChanged(auth, (user) => {
  adminUser = user || null;

  // Botão admin no topo (se existir)
  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) adminBtn.style.display = adminUser ? "flex" : "none";

  renderAdmin();
  goToHashRoute();
});

/* =========================
   ADMIN - UPLOAD CLOUDINARY
========================= */

window.abrirUploadCloudinary = function abrirUploadCloudinary() {
  if (!adminUser) {
    alert("Faça login para importar fotos.");
    return;
  }

  if (!window.cloudinary) {
    alert("Cloudinary widget não carregou.");
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
};

function renderAdminPhotos() {
  const grid = document.getElementById("photoGrid");
  if (!grid) return;

  if (!adminImages.length) {
    grid.innerHTML = `<div class="muted" style="font-weight:800;">Nenhuma foto adicionada.</div>`;
    return;
  }

  grid.innerHTML = adminImages.map((url, i) => `
    <div class="admin-photo">
      <img src="${url}" alt="">
      <button class="admin-photo-x" onclick="removerFoto(${i})" type="button">×</button>
    </div>
  `).join("");
}

window.removerFoto = function removerFoto(i) {
  adminImages.splice(i, 1);
  renderAdminPhotos();
};

window.limparFotos = function limparFotos() {
  adminImages = [];
  renderAdminPhotos();
};

/* =========================
   ADMIN - SALVAR PRODUTO
========================= */

window.adminAdicionarProduto = async function adminAdicionarProduto() {
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
};

/* =========================
   ADMIN - LISTAR E EXCLUIR
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
    const imgs =
      Array.isArray(p.imagens) && p.imagens.length
        ? p.imagens
        : (p.imagemUrl ? [p.imagemUrl] : []);

    return `
      <div class="admin-item">
        <div class="admin-mini">
          <img src="${imgs[0] || ""}" alt="">
        </div>

        <div class="admin-info">
          <div class="admin-name">${escapeHtml(p.nome)}</div>
          <div class="admin-meta">${escapeHtml(p.categoria || "")} • R$ ${money(p.preco)}</div>
        </div>

        <button class="btn danger" onclick="adminExcluir('${p.id}')">
          Excluir
        </button>
      </div>
    `;
  }).join("");
}

window.adminExcluir = async function adminExcluir(id) {
  if (!adminUser) return;

  if (!confirm("Deseja excluir este produto?")) return;

  try {
    await deleteDoc(doc(db, COLLECTION, id));
    alert("Excluído.");
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir. Veja o console.");
  }
};

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  updateBadge();
  listenProdutos();
  goToHashRoute();
  window.addEventListener("hashchange", goToHashRoute);

  // Admin fotos inicial
  renderAdminPhotos();

  // Ano do footer se existir
  const fy = document.getElementById("footerYear");
  if (fy) fy.textContent = new Date().getFullYear();
});
