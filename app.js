// ===============================
// ALMA BELA - Firebase + Cloudinary
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
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

// ---------- CONFIG ----------
const CONFIG = {
  NOME_LOJA: "ALMA BELA",
  WHATSAPP: "5521979405145",

  CLOUDINARY: {
    cloudName: "CLOUD_NAME_AQUI",
    uploadPreset: "UPLOAD_PRESET_AQUI"
  }
};

// ---------- FIREBASE CONFIG (SEU) ----------
const firebaseConfig = {
  apiKey: "AIzaSyAMfepLXbYP5oKIZlJ91vDevfbzHEzmoMk",
  authDomain: "almabela.firebaseapp.com",
  projectId: "almabela",
  storageBucket: "almabela.firebasestorage.app",
  messagingSenderId: "304950181664",
  appId: "1:304950181664:web:4f14dfa6dd0fcf9224a145",
  measurementId: "G-2BZDHCSZSQ"
};

// ---------- INIT ----------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const productsRef = collection(db, "products");

// ---------- ESTADO ----------
let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("almabela_cart_firestore")) || [];
let adminUser = null;

// ---------- HELPERS ----------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- MENU MOBILE ----------
window.toggleMenu = function toggleMenu() {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.toggle("open");
};

function fecharMenu() {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.remove("open");
}

// ---------- VIEW ----------
window.showView = function showView(nome, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const sec = document.getElementById(nome);
  if (sec) sec.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  if (ev && ev.target && ev.target.classList.contains("nav-link")) ev.target.classList.add("active");

  fecharMenu();

  if (nome === "colecao") renderizarProdutos();
  if (nome === "admin") renderizarAdmin();
};

// ---------- MODAIS ----------
window.openModal = function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
};

window.closeModal = function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
};

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) e.target.classList.remove("active");
});

// ---------- FIRESTORE REALTIME ----------
function iniciarListenerProdutos() {
  const q = query(productsRef, orderBy("criadoEm", "desc"));

  onSnapshot(q, (snap) => {
    produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderizarProdutos();
    renderizarAdmin();
  });
}

// ---------- RENDER PRODUTOS ----------
function renderizarProdutos() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  if (!produtos.length) {
    grid.innerHTML = `<p style="text-align:center;color:#777;">Nenhum produto disponível</p>`;
    return;
  }

  grid.innerHTML = produtos.map(p => `
    <div class="product-card">
      <img src="${p.imagemUrl}" alt="${escapeHtml(p.nome)}" class="product-image">
      <div class="product-info">
        <div class="product-tag">${escapeHtml(p.categoria || "Lingerie")}</div>
        <div class="product-name">${escapeHtml(p.nome)}</div>
        <div class="product-price">R$ ${Number(p.preco).toFixed(2)}</div>
        <button class="btn-add" onclick="adicionarAoCarrinho('${p.id}')">+ Adicionar</button>
      </div>
    </div>
  `).join("");
}

// ---------- CARRINHO ----------
function salvarCarrinho() {
  localStorage.setItem("almabela_cart_firestore", JSON.stringify(carrinho));
  atualizarBadge();
}

function atualizarBadge() {
  const badge = document.getElementById("badge");
  if (badge) badge.textContent = carrinho.reduce((s, x) => s + x.qtd, 0);
}

window.adicionarAoCarrinho = function adicionarAoCarrinho(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  const item = carrinho.find(x => x.id === id);
  if (item) item.qtd++;
  else carrinho.push({ id: p.id, nome: p.nome, preco: Number(p.preco), imagemUrl: p.imagemUrl, qtd: 1 });

  salvarCarrinho();
  openCart();
};

window.openCart = function openCart() {
  renderizarCarrinho();
  openModal("cartModal");
};

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

window.mudarQtd = function mudarQtd(idx, change) {
  carrinho[idx].qtd += change;
  if (carrinho[idx].qtd <= 0) carrinho.splice(idx, 1);
  salvarCarrinho();
  renderizarCarrinho();
};

window.removerItem = function removerItem(idx) {
  carrinho.splice(idx, 1);
  salvarCarrinho();
  renderizarCarrinho();
};

window.finalizarWhatsApp = function finalizarWhatsApp() {
  if (!carrinho.length) return;

  let msg = `🛍️ Pedido - ${CONFIG.NOME_LOJA}\n\n`;
  carrinho.forEach((x, i) => {
    msg += `${i + 1}. ${x.nome}\nR$ ${x.preco.toFixed(2)} x ${x.qtd} = R$ ${(x.preco * x.qtd).toFixed(2)}\n\n`;
  });

  const total = carrinho.reduce((s, x) => s + x.preco * x.qtd, 0);
  msg += `💰 Total: R$ ${total.toFixed(2)}\n\n✨ Obrigado!`;

  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
};

// ---------- ADMIN LOGIN ----------
window.openLogin = function openLogin() {
  openModal("loginModal");
};

window.adminLogin = async function adminLogin() {
  const email = (document.getElementById("emailInput").value || "").trim();
  const senha = (document.getElementById("passInput").value || "").trim();
  const msg = document.getElementById("loginMsg");

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    closeModal("loginModal");
    if (msg) msg.className = "msg";
  } catch (e) {
    if (msg) {
      msg.className = "msg show error";
      msg.textContent = "❌ Login inválido";
      setTimeout(() => msg.classList.remove("show"), 2500);
    }
  }
};

window.adminSair = async function adminSair() {
  await signOut(auth);
};

// ---------- ADMIN UI ----------
function renderizarAdmin() {
  const locked = document.getElementById("adminLocked");
  const panel = document.getElementById("adminPanel");
  const list = document.getElementById("adminList");
  if (!locked || !panel || !list) return;

  if (!adminUser) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }

  locked.style.display = "none";
  panel.style.display = "block";

  list.innerHTML = produtos.map(p => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(p.nome)}</strong><br/>
        <small>${escapeHtml(p.categoria || "Lingerie")} • R$ ${Number(p.preco).toFixed(2)}</small>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="adminExcluirProduto('${p.id}')">Excluir</button>
      </div>
    </div>
  `).join("");
}

// ---------- CRUD FIRESTORE ----------
window.adminAdicionarProduto = async function adminAdicionarProduto() {
  if (!adminUser) return;

  const nome = (document.getElementById("pNome").value || "").trim();
  const categoria = (document.getElementById("pCategoria").value || "").trim() || "Lingerie";
  const preco = Number(document.getElementById("pPreco").value);
  const imagemUrl = (document.getElementById("pImagem").value || "").trim();

  if (!nome || !imagemUrl || !Number.isFinite(preco) || preco <= 0) {
    alert("Preencha Nome, Preço e a imagem.");
    return;
  }

  await addDoc(collection(db, "products"), {
    nome,
    categoria,
    preco,
    imagemUrl,
    criadoEm: serverTimestamp()
  });

  document.getElementById("pNome").value = "";
  document.getElementById("pCategoria").value = "";
  document.getElementById("pPreco").value = "";
  document.getElementById("pImagem").value = "";
};

window.adminExcluirProduto = async function adminExcluirProduto(id) {
  if (!adminUser) return;
  await deleteDoc(doc(db, "products", id));
};

// ---------- CLOUDINARY UPLOAD (GALERIA) ----------
window.abrirUploadCloudinary = function abrirUploadCloudinary() {
  if (!CONFIG.CLOUDINARY.cloudName || !CONFIG.CLOUDINARY.uploadPreset) {
    alert("Preencha CLOUD_NAME e UPLOAD_PRESET no app.js");
    return;
  }

  const widget = cloudinary.createUploadWidget(
    {
      cloudName: CONFIG.CLOUDINARY.cloudName,
      uploadPreset: CONFIG.CLOUDINARY.uploadPreset,
      sources: ["local", "camera", "url"],
      multiple: false
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        const url = result.info.secure_url;
        const inp = document.getElementById("pImagem");
        if (inp) inp.value = url;
        alert("✅ Imagem enviada para o Cloudinary!");
      }
    }
  );

  widget.open();
};

// ---------- ADMIN ESCONDIDO ----------
function checarHashAdmin() {
  const hash = (location.hash || "").replace("#", "");
  if (hash === "admin") showView("admin");
}
window.addEventListener("hashchange", checarHashAdmin);

// ---------- CONTATO ----------
function updateWhatsLink() {
  const el = document.getElementById("whatsLink");
  if (!el) return;
  el.href = `https://wa.me/${CONFIG.WHATSAPP}`;
  el.textContent = `+${CONFIG.WHATSAPP}`;
}

// ---------- INIT ----------
onAuthStateChanged(auth, (user) => {
  adminUser = user || null;
  renderizarAdmin();
});

document.addEventListener("DOMContentLoaded", () => {
  updateWhatsLink();
  atualizarBadge();
  checarHashAdmin();
  iniciarListenerProdutos();
});
