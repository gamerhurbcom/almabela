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

/* ==========================
   CONFIG (TROQUE O CLOUDINARY)
========================== */
const CONFIG = {
  NOME_LOJA: "ALMA BELA",
  WHATSAPP: "5521979405145",

  CLOUDINARY: {
    cloudName: "doi067uao",
    uploadPreset: "Unsigned"
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyAMfepLXbYP5oKIZlJ91vDevfbzHEzmoMk",
  authDomain: "almabela.firebaseapp.com",
  projectId: "almabela",
  storageBucket: "almabela.firebasestorage.app",
  messagingSenderId: "304950181664",
  appId: "1:304950181664:web:4f14dfa6dd0fcf9224a145",
  measurementId: "G-2BZDHCSZSQ"
};

/* ==========================
   INIT
========================== */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const productsRef = collection(db, "products");

/* ==========================
   STATE
========================== */
let produtos = [];
let produtosFiltrados = [];
let carrinho = JSON.parse(localStorage.getItem("almabela_cart")) || [];
let adminUser = null;

/* ==========================
   HELPERS
========================== */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function money(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

/* Mensagens (usa a caixa loginMsg) */
function toast(texto, isError = false) {
  const box = document.getElementById("loginMsg");
  if (!box) return;
  box.textContent = texto;
  box.style.display = "block";
  box.style.borderColor = isError ? "rgba(226,74,59,.35)" : "rgba(60,170,90,.35)";
  box.style.background = isError ? "rgba(226,74,59,.10)" : "rgba(60,170,90,.10)";
  box.style.color = isError ? "#7a1f1b" : "#145a2a";
  setTimeout(() => (box.style.display = "none"), 2200);
}

/* ==========================
   MENU / VIEW
========================== */
window.toggleMenu = function toggleMenu() {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.toggle("open");
};

function closeMenu() {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.remove("open");
}

window.showView = function showView(name, ev) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(name);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
  if (ev?.target?.classList?.contains("nav-link")) ev.target.classList.add("active");

  closeMenu();

  if (name === "colecao") renderProdutos();
  if (name === "admin") renderAdmin();
};

/* ==========================
   MODAL
========================== */
window.openModal = function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
};
window.closeModal = function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
};
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) e.target.classList.remove("active");
});

/* ==========================
   PRODUCTS (FIRESTORE)
========================== */
function listenProdutos() {
  const q = query(productsRef, orderBy("criadoEm", "desc"));
  onSnapshot(q, (snap) => {
    produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    produtosFiltrados = [...produtos];
    preencherCategorias();
    renderProdutos();
    renderAdmin();
  });
}

function preencherCategorias() {
  const select = document.getElementById("catSelect");
  if (!select) return;

  const atual = select.value || "";
  const cats = Array.from(new Set(produtos.map(p => (p.categoria || "").trim()).filter(Boolean))).sort();

  select.innerHTML = `
    <option value="">Todas as categorias</option>
    ${cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
  `;

  select.value = cats.includes(atual) ? atual : "";
}

window.filtrarProdutos = function filtrarProdutos() {
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const cat = (document.getElementById("catSelect")?.value || "").trim();

  produtosFiltrados = produtos.filter(p => {
    const nome = String(p.nome || "").toLowerCase();
    const okNome = !q || nome.includes(q);
    const okCat = !cat || (p.categoria || "").trim() === cat;
    return okNome && okCat;
  });

  renderProdutos();
};

function renderProdutos() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const list = produtosFiltrados;

  if (!list.length) {
    grid.innerHTML = `<div class="card"><p>Nenhum produto encontrado.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="product">
      <img class="product-img" src="${p.imagemUrl}" alt="${escapeHtml(p.nome)}">
      <div class="product-body">
        <div class="product-meta">
          <span class="tag">${escapeHtml(p.categoria || "Lingerie")}</span>
          <span class="price">R$ ${money(p.preco)}</span>
        </div>
        <div class="title">${escapeHtml(p.nome)}</div>
        <button class="btn primary full" onclick="addToCart('${p.id}')">
          <i class="fa-solid fa-plus"></i>
          Adicionar
        </button>
      </div>
    </article>
  `).join("");
}

/* ==========================
   CART
========================== */
function saveCart() {
  localStorage.setItem("almabela_cart", JSON.stringify(carrinho));
  updateBadge();
}
function updateBadge() {
  const badge = document.getElementById("badge");
  if (badge) badge.textContent = carrinho.reduce((s, x) => s + x.qtd, 0);
}

window.addToCart = function addToCart(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  const item = carrinho.find(x => x.id === id);
  if (item) item.qtd += 1;
  else carrinho.push({ id: p.id, nome: p.nome, preco: Number(p.preco), imagemUrl: p.imagemUrl, qtd: 1 });

  saveCart();
  window.openCart();
};

window.openCart = function openCart() {
  renderCart();
  openModal("cartModal");
};

function renderCart() {
  const el = document.getElementById("cartList");
  if (!el) return;

  if (!carrinho.length) {
    el.innerHTML = `<div class="cart-empty">Seu carrinho está vazio.</div>`;
    return;
  }

  const total = carrinho.reduce((s, x) => s + (Number(x.preco) * x.qtd), 0);

  el.innerHTML = `
    <div class="cart-list">
      ${carrinho.map((x, i) => `
        <div class="cart-row">
          <img src="${x.imagemUrl}" alt="">
          <div class="cart-info">
            <div class="cart-name">${escapeHtml(x.nome)}</div>
            <div class="cart-sub">R$ ${money(x.preco)}</div>

            <div class="cart-actions">
              <div class="qty">
                <button onclick="changeQty(${i}, -1)">-</button>
                <span>${x.qtd}</span>
                <button onclick="changeQty(${i}, 1)">+</button>
              </div>
              <button class="remove" onclick="removeItem(${i})">Remover</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="summary">
      <div class="sum-line"><span>Subtotal</span><span>R$ ${money(total)}</span></div>
      <div class="sum-line"><span>Frete</span><span>A combinar</span></div>
      <div class="sum-line total"><span>Total</span><span>R$ ${money(total)}</span></div>
    </div>
  `;
}

window.changeQty = function changeQty(index, delta) {
  carrinho[index].qtd += delta;
  if (carrinho[index].qtd <= 0) carrinho.splice(index, 1);
  saveCart();
  renderCart();
};

window.removeItem = function removeItem(index) {
  carrinho.splice(index, 1);
  saveCart();
  renderCart();
};

window.finalizarWhatsApp = function finalizarWhatsApp() {
  if (!carrinho.length) return;

  let msg = `Pedido - ${CONFIG.NOME_LOJA}\n\n`;
  carrinho.forEach((x, i) => {
    msg += `${i + 1}. ${x.nome}\nR$ ${money(x.preco)} x ${x.qtd} = R$ ${money(Number(x.preco) * x.qtd)}\n\n`;
  });

  const total = carrinho.reduce((s, x) => s + (Number(x.preco) * x.qtd), 0);
  msg += `Total: R$ ${money(total)}\n`;

  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* ==========================
   ADMIN (AUTH)
========================== */
window.openLogin = function openLogin() {
  const box = document.getElementById("loginMsg");
  if (box) box.style.display = "none";
  openModal("loginModal");
};

window.adminLogin = async function adminLogin() {
  const email = (document.getElementById("emailInput")?.value || "").trim();
  const pass = (document.getElementById("passInput")?.value || "").trim();

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal("loginModal");
    toast("Login realizado com sucesso.");
    // se estiver tentando acessar admin, abre o painel
    checkAdminHash();
  } catch (e) {
    toast("Credenciais inválidas.", true);
  }
};

window.adminSair = async function adminSair() {
  await signOut(auth);
  toast("Sessão encerrada.");
  // volta pra coleção e remove #admin se existir
  history.replaceState(null, "", "#");
  showView("colecao");
};

function renderAdmin() {
  const locked = document.getElementById("adminLocked");
  const panel = document.getElementById("adminPanel");
  const list = document.getElementById("adminList");
  const count = document.getElementById("adminCount");

  if (!locked || !panel || !list) return;

  if (!adminUser) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }

  locked.style.display = "none";
  panel.style.display = "block";

  if (count) count.textContent = `${produtos.length} itens`;

  list.innerHTML = produtos.map(p => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(p.nome)}</strong><br>
        <small>${escapeHtml(p.categoria || "Lingerie")} · R$ ${money(p.preco)}</small>
      </div>
      <button class="btn outline" onclick="adminExcluirProduto('${p.id}')">
        <i class="fa-solid fa-trash"></i> Excluir
      </button>
    </div>
  `).join("");
}

window.adminAdicionarProduto = async function adminAdicionarProduto() {
  if (!adminUser) {
    toast("Acesso negado. Faça login.", true);
    openLogin();
    return;
  }

  const nome = (document.getElementById("pNome")?.value || "").trim();
  const categoria = (document.getElementById("pCategoria")?.value || "").trim() || "Lingerie";
  const preco = Number(document.getElementById("pPreco")?.value);
  const imagemUrl = (document.getElementById("pImagem")?.value || "").trim();

  if (!nome || !imagemUrl || !Number.isFinite(preco) || preco <= 0) {
    toast("Preencha nome, categoria, preço e imagem.", true);
    return;
  }

  try {
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

    toast("Produto cadastrado com sucesso.");
    showView("admin"); // mantém no painel
  } catch (e) {
    toast("Permissão insuficiente no Firestore (Rules).", true);
  }
};

window.adminExcluirProduto = async function adminExcluirProduto(id) {
  if (!adminUser) {
    toast("Acesso negado. Faça login.", true);
    openLogin();
    return;
  }

  try {
    await deleteDoc(doc(db, "products", id));
    toast("Produto excluído com sucesso.");
  } catch (e) {
    toast("Permissão insuficiente no Firestore (Rules).", true);
  }
};

/* ==========================
   CLOUDINARY (UPLOAD GALERIA)
========================== */
window.abrirUploadCloudinary = function abrirUploadCloudinary() {
  if (!adminUser) {
    toast("Acesso negado. Faça login.", true);
    openLogin();
    return;
  }

  if (!CONFIG.CLOUDINARY.cloudName || !CONFIG.CLOUDINARY.uploadPreset ||
      CONFIG.CLOUDINARY.cloudName.includes("AQUI") || CONFIG.CLOUDINARY.uploadPreset.includes("AQUI")) {
    toast("Configure cloudName e uploadPreset no app.js.", true);
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
      if (!error && result?.event === "success") {
        const url = result.info.secure_url;
        const input = document.getElementById("pImagem");
        if (input) input.value = url;
        toast("Imagem enviada com sucesso.");
      }
    }
  );

  widget.open();
};

/* ==========================
   ADMIN ESCONDIDO / BLOQUEADO
========================== */
function checkAdminHash() {
  const hash = (location.hash || "").replace("#", "");

  if (hash === "admin") {
    if (!adminUser) {
      // tira o #admin e manda pra coleção
      history.replaceState(null, "", "#");
      showView("colecao");
      openLogin(); // abre login automaticamente
      return;
    }
    showView("admin");
  }
}
window.addEventListener("hashchange", checkAdminHash);

/* ==========================
   CONTACT + INIT
========================== */
function updateWhatsLink() {
  const el = document.getElementById("whatsLink");
  if (!el) return;
  el.href = `https://wa.me/${CONFIG.WHATSAPP}`;
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

onAuthStateChanged(auth, (user) => {
  adminUser = user || null;
  renderAdmin();
  checkAdminHash(); // se estiver logado e for #admin, libera
});

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  updateWhatsLink();
  updateBadge();
  checkAdminHash();
  listenProdutos();
});
