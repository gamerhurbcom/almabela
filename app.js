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
   CONFIG
========================== */
const CONFIG = {
  NOME_LOJA: "ALMA BELA",
  WHATSAPP: "5521979405145",

  CLOUDINARY: {
    cloudName: "doi067uao",
    uploadPreset: "Unsigned"
  }
};

/* Firebase config */
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
const auth = getAuth(app);
const db = getFirestore(app);

/* ==========================
   STATE
========================== */
let produtos = [];
let produtosFiltrados = [];
let carrinho = JSON.parse(localStorage.getItem("almabela_cart")) || [];
let adminUser = null;

// Modal Produto
let pvImages = [];
let pvIndex = 0;
let pvProductId = null;

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

function toast(texto, isError = false) {
  const el = document.getElementById("loginMsg");
  if (!el) return;

  el.textContent = texto;
  el.style.display = "block";
  el.style.borderColor = isError ? "rgba(226,74,59,.35)" : "rgba(60,170,90,.35)";
  el.style.background = isError ? "rgba(226,74,59,.10)" : "rgba(60,170,90,.10)";
  el.style.color = isError ? "#7a1f1b" : "#145a2a";

  setTimeout(() => (el.style.display = "none"), 2500);
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

window.goAdmin = function goAdmin() {
  showView("admin");
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
   FIRESTORE: LISTEN PRODUCTS
========================== */
function listenProdutos() {
  const q = query(collection(db, "products"), orderBy("criadoEm", "desc"));
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

/* ==========================
   CARROSSEL (CARD)
========================== */
function renderCarousel(p) {
  const imgs =
    Array.isArray(p.imagens) && p.imagens.length
      ? p.imagens
      : (p.imagemUrl ? [p.imagemUrl] : []);

  if (!imgs.length) {
    return `
      <div class="carousel">
        <div style="padding:16px;color:#777;font-weight:800;">Sem imagem</div>
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
        <button class="carousel-btn prev" onclick="event.stopPropagation(); carouselPrev('${id}')">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="carousel-btn next" onclick="event.stopPropagation(); carouselNext('${id}')">
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <div class="carousel-dots" onclick="event.stopPropagation()">
          ${imgs.map((_, i) => `<div class="dot ${i === 0 ? "active" : ""}" onclick="carouselGo('${id}', ${i})"></div>`).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function getCarouselState(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const track = el.querySelector(".carousel-track");
  const imgs = el.querySelectorAll(".carousel-img");
  const dots = el.querySelectorAll(".dot");
  return { el, track, imgs, dots };
}

function setCarouselIndex(id, index) {
  const st = getCarouselState(id);
  if (!st) return;

  const total = st.imgs.length;
  if (!total) return;

  let i = index;
  if (i < 0) i = total - 1;
  if (i >= total) i = 0;

  st.track.style.transform = `translateX(-${i * 100}%)`;
  st.dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  st.el.dataset.index = String(i);
}

window.carouselNext = function carouselNext(id) {
  const st = getCarouselState(id);
  const idx = Number(st?.el?.dataset?.index || 0);
  setCarouselIndex(id, idx + 1);
};

window.carouselPrev = function carouselPrev(id) {
  const st = getCarouselState(id);
  const idx = Number(st?.el?.dataset?.index || 0);
  setCarouselIndex(id, idx - 1);
};

window.carouselGo = function carouselGo(id, index) {
  setCarouselIndex(id, index);
};

/* ==========================
   RENDER PRODUTOS
========================== */
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
        <button class="btn primary full" onclick="addToCart('${p.id}')">Adicionar</button>
      </div>
    </article>
  `).join("");
}

/* ==========================
   MODAL PRODUTO
========================== */
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

/* Swipe modal */
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
  const el = document.getElementById("cartList");
  if (!el) return;

  if (!carrinho.length) {
    el.innerHTML = `<div class="cart-empty">Seu carrinho está vazio.</div>`;
    return;
  }

  const total = carrinho.reduce((s, x) => s + (Number(x.preco) * x.qtd), 0);

  el.innerHTML = `
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
   ADMIN AUTH
========================== */
window.openLogin = function openLogin() {
  openModal("loginModal");
};

window.adminLogin = async function adminLogin() {
  const email = (document.getElementById("emailInput")?.value || "").trim();
  const pass = (document.getElementById("passInput")?.value || "").trim();

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal("loginModal");
    toast("Login realizado com sucesso.");
    showView("admin");
  } catch {
    alert("Credenciais inválidas.");
  }
};

window.adminSair = async function adminSair() {
  await signOut(auth);
  toast("Sessão encerrada.");
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

  list.innerHTML = produtos.map(p => {
    const imgPrincipal =
      (Array.isArray(p.imagens) && p.imagens[0]) ? p.imagens[0] :
      (p.imagemUrl ? p.imagemUrl : "");

    return `
      <div class="admin-item">
        <div style="display:flex; gap:10px; align-items:center;">
          <img src="${imgPrincipal}" style="width:54px;height:54px;border-radius:16px;object-fit:cover;border:1px solid rgba(0,0,0,.08);" />
          <div>
            <strong>${escapeHtml(p.nome)}</strong><br>
            <small>${escapeHtml(p.categoria || "Lingerie")} · R$ ${money(p.preco)}</small>
          </div>
        </div>
        <button class="btn outline" onclick="adminExcluirProduto('${p.id}')">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </div>
    `;
  }).join("");
}

function renderPhotoGrid(urls) {
  const grid = document.getElementById("photoGrid");
  if (!grid) return;

  if (!urls.length) {
    grid.innerHTML = `<div class="photo-empty">Nenhuma foto importada</div>`;
    return;
  }

  grid.innerHTML = urls.map(u => `
    <div class="photo-thumb">
      <img src="${u}" alt="">
    </div>
  `).join("");
}

window.limparFotos = function limparFotos() {
  const t = document.getElementById("pImagens");
  if (t) t.value = "";
  renderPhotoGrid([]);
  toast("Fotos limpas.");
};

window.adminAdicionarProduto = async function adminAdicionarProduto() {
  if (!adminUser) {
    toast("Acesso negado. Faça login.", true);
    openLogin();
    return;
  }

  const nome = (document.getElementById("pNome")?.value || "").trim();
  const categoria = (document.getElementById("pCategoria")?.value || "").trim() || "Lingerie";
  const preco = Number(document.getElementById("pPreco")?.value);

  const imagensRaw = (document.getElementById("pImagens")?.value || "").trim();
  const imagens = imagensRaw ? imagensRaw.split("\n").map(x => x.trim()).filter(Boolean) : [];

  if (!nome || !imagens.length || !Number.isFinite(preco) || preco <= 0) {
    toast("Preencha nome, preço e importe pelo menos 1 foto.", true);
    return;
  }

  try {
    await addDoc(collection(db, "products"), { nome, categoria, preco, imagens, criadoEm: serverTimestamp() });

    document.getElementById("pNome").value = "";
    document.getElementById("pCategoria").value = "";
    document.getElementById("pPreco").value = "";
    document.getElementById("pImagens").value = "";
    renderPhotoGrid([]);

    toast("Produto cadastrado com sucesso.");
    showView("admin");
  } catch {
    toast("Permissão insuficiente no Firestore (Rules).", true);
  }
};

window.adminExcluirProduto = async function adminExcluirProduto(id) {
  if (!adminUser) {
    toast("Acesso negado. Faça login.", true);
    openLogin();
    return;
  }

  const ok = confirm("Deseja excluir este produto?");
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "products", id));
    toast("Produto excluído com sucesso.");
  } catch {
    toast("Permissão insuficiente no Firestore (Rules).", true);
  }
};

/* ==========================
   CLOUDINARY (UPLOAD MÚLTIPLO)
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
      sources: ["local","camera","url"],
      multiple: true,
      maxFiles: 12
    },
    (error, result) => {
      if (error) return;

      if (result?.event === "success") {
        const url = result.info.secure_url;
        const t = document.getElementById("pImagens");
        if (!t) return;

        const atual = (t.value || "").trim();
        const novo = atual ? `${atual}\n${url}` : url;
        t.value = novo;

        const urls = novo.split("\n").map(x => x.trim()).filter(Boolean);
        renderPhotoGrid(urls);
      }
    }
  );

  widget.open();
};

/* ==========================
   INIT
========================== */
function updateWhatsLink() {
  const el = document.getElementById("whatsLink");
  if (el) el.href = `https://wa.me/${CONFIG.WHATSAPP}`;
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

onAuthStateChanged(auth, (user) => {
  adminUser = user || null;

  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) adminBtn.style.display = adminUser ? "flex" : "none";

  renderAdmin();
});

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  updateWhatsLink();
  updateBadge();
  listenProdutos();
});

const fy = document.getElementById("footerYear");
if (fy) fy.textContent = new Date().getFullYear();
