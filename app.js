Não! 😅 Está TUDO JUNTO em um arquivo HTML. Deixa eu separar nos 4 arquivos que você pediu + logo PNG!

📁 4 Arquivos Separados:
1️⃣ index.html
2️⃣ styles.css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    box-sizing: border-box;
}

:root {
    --primary: #c9a17a;
    --primary-dark: #a68567;
    --accent: #d4927d;
    --bg-light: #faf7f4;
    --text-dark: #1a1a1a;
    --text-gray: #666;
    --border: #e8dcd8;
    --light-hover: #f5f0ed;
}

html, body {
    height: 100%;
    width: 100%;
    font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
    background-color: var(--bg-light);
    color: var(--text-dark);
}

body[unresolved] {
    opacity: 0;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

header {
    background: white;
    border-bottom: 1px solid var(--border);
    padding: 12px 0;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--text-dark);
    cursor: pointer;
    transition: opacity 0.3s;
}

.logo:hover {
    opacity: 0.8;
}

.logo-img {
    height: 40px;
    width: auto;
}

.logo-text h1 {
    font-size: 18px;
    font-weight: 300;
    letter-spacing: 2px;
}

.logo-text p {
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--primary);
}

.nav {
    display: flex;
    gap: 30px;
    flex: 1;
}

.nav a {
    text-decoration: none;
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s;
    position: relative;
}

.nav a:hover {
    color: var(--primary);
}

.nav a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--primary);
    transition: width 0.3s;
}

.nav a:hover::after {
    width: 100%;
}

.header-right {
    display: flex;
    gap: 10px;
    align-items: center;
}

.cart-btn {
    padding: 8px 12px;
    background: white;
    color: var(--primary);
    border: 1px solid var(--primary);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s;
    position: relative;
}

.cart-btn:hover {
    background: var(--primary);
    color: white;
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--accent);
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
}

.menu-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
}

.menu-toggle span {
    width: 24px;
    height: 2px;
    background: var(--text-dark);
    transition: all 0.3s;
}

main {
    padding: 40px 0;
    min-height: calc(100% - 60px);
}

.section {
    display: none;
}

.section.active {
    display: block;
}

.hero {
    text-align: center;
    margin-bottom: 50px;
    animation: fadeInDown 0.8s ease;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero h1 {
    font-size: 42px;
    font-weight: 300;
    margin-bottom: 12px;
    letter-spacing: 2px;
}

.hero p {
    font-size: 15px;
    color: var(--text-gray);
    letter-spacing: 1px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 25px;
}

.product-card {
    background: white;
    border: 1px solid var(--border);
    transition: all 0.4s;
    cursor: pointer;
    animation: fadeIn 0.6s ease forwards;
    opacity: 0;
}

.product-card:nth-child(1) { animation-delay: 0.1s; }
.product-card:nth-child(2) { animation-delay: 0.2s; }
.product-card:nth-child(3) { animation-delay: 0.3s; }
.product-card:nth-child(4) { animation-delay: 0.4s; }
.product-card:nth-child(5) { animation-delay: 0.5s; }
.product-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

.product-card:hover {
    border-color: var(--primary);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-5px);
}

.product-image-wrapper {
    height: 280px;
    overflow: hidden;
    background: var(--light-hover);
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.product-card:hover .product-image {
    transform: scale(1.05);
}

.product-info {
    padding: 18px;
}

.product-category {
    font-size: 10px;
    color: var(--primary);
    text-transform: uppercase;
    margin-bottom: 8px;
    font-weight: 600;
    letter-spacing: 2px;
}

.product-name {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}

.product-price {
    font-size: 17px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 12px;
}

.add-to-cart {
    width: 100%;
    padding: 10px;
    background: white;
    color: var(--primary);
    border: 1px solid var(--primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.add-to-cart:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 100;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeInModal 0.3s ease;
    overflow-y: auto;
}

@keyframes fadeInModal {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal.active {
    display: flex;
}

.modal-content {
    background: white;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.4s ease;
    border-radius: 8px;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    padding: 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--light-hover);
}

.modal-title {
    font-size: 20px;
    font-weight: 400;
    letter-spacing: 1px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: var(--text-gray);
    transition: color 0.2s ease;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    color: var(--text-dark);
}

.modal-body {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-dark);
    font-size: 13px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border);
    background: var(--light-hover);
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.image-preview {
    width: 100%;
    max-width: 150px;
    height: 150px;
    object-fit: cover;
    margin: 12px auto;
    display: none;
}

.image-preview.active {
    display: block;
}

.page-section {
    background: white;
    padding: 40px;
    border-radius: 8px;
    line-height: 1.8;
}

.page-section h2 {
    font-size: 32px;
    margin-bottom: 20px;
    color: var(--primary);
}

.page-section p {
    color: var(--text-gray);
    margin-bottom: 15px;
    font-size: 14px;
}

.page-section a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
}

.page-section a:hover {
    text-decoration: underline;
}

.cart-item {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid var(--border);
    align-items: flex-start;
}

.cart-item-image {
    width: 60px;
    height: 75px;
    object-fit: cover;
    background: var(--light-hover);
    flex-shrink: 0;
}

.cart-item-details {
    flex: 1;
}

.cart-item-name {
    font-weight: 500;
    margin-bottom: 6px;
    font-size: 13px;
}

.cart-item-price {
    color: var(--accent);
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 6px;
}

.cart-footer {
    padding: 18px;
    border-top: 1px solid var(--border);
    background: var(--light-hover);
}

.cart-total {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
}

.total-value {
    color: var(--accent);
    font-size: 17px;
}

.message {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 12px;
    border-left: 4px solid;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border-left-color: #28a745;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border-left-color: #dc3545;
}

.message.warning {
    background: #fff3cd;
    color: #856404;
    border-left-color: #ffc107;
}

.admin-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    color: white;
    padding: 24px;
    margin: -40px -20px 30px -20px;
    border-radius: 0;
}

.admin-header h2 {
    font-size: 24px;
    font-weight: 400;
    margin-bottom: 6px;
    letter-spacing: 1px;
}

.admin-header p {
    font-size: 12px;
    letter-spacing: 0.5px;
    opacity: 0.9;
}

.products-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border: 1px solid var(--border);
    font-size: 13px;
}

.products-table th {
    background: var(--light-hover);
    color: var(--text-dark);
    padding: 12px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-bottom: 1px solid var(--border);
}

.products-table td {
    padding: 12px;
    border-bottom: 1px solid var(--border);
}

.products-table tr:hover {
    background: var(--light-hover);
}

.action-btns {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-sm {
    padding: 6px 10px;
    font-size: 10px;
    border-radius: 4px;
    border: 1px solid;
    cursor: pointer;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
}

.btn-edit {
    background: white;
    color: var(--primary);
    border-color: var(--primary);
}

.btn-edit:hover {
    background: var(--primary);
    color: white;
}

.btn-delete {
    background: white;
    color: var(--accent);
    border-color: var(--accent);
}

.btn-delete:hover {
    background: var(--accent);
    color: white;
}

.btn {
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.btn-primary {
    background: var(--primary);
    color: white;
    border: 1px solid var(--primary);
}

.btn-primary:hover {
    background: white;
    color: var(--primary);
}

.btn-secondary {
    background: white;
    color: var(--primary);
    border: 1px solid var(--primary);
}

.btn-secondary:hover {
    background: var(--light-hover);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.security-warning {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 20px;
    color: #856404;
    font-size: 12px;
}

@media (max-width: 768px) {
    .nav {
        display: none;
        position: fixed;
        top: 50px;
        left: 0;
        right: 0;
        flex-direction: column;
        background: white;
        padding: 16px;
        gap: 12px;
        border-top: 1px solid var(--border);
        z-index: 49;
        overflow-y: auto;
    }

    .nav.active {
        display: flex;
    }

    .menu-toggle {
        display: flex;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 12px;
    }

    .hero h1 {
        font-size: 24px;
    }

    .hero p {
        font-size: 13px;
    }

    .page-section {
        padding: 20px;
    }

    .page-section h2 {
        font-size: 20px;
    }

    .modal-content {
        max-height: 85vh;
    }
}

@media (max-width: 480px) {
    .logo-text h1 {
        font-size: 14px;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    }

    .hero h1 {
        font-size: 20px;
    }
}

3️⃣ config.js
// ========== CONFIGURAÇÃO DA LOJA ==========
const ADMIN_EMAIL = 'gomessilva@gmail.com';
const CORRECT_PASSWORD_HASH = CryptoJS.SHA256('120624rg').toString();
const WHATSAPP_NUMBER = '5521979405145';

// ========== SEGURANÇA ==========
const SECURITY_CONFIG = {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    sessionTimeout: 30 * 60 * 1000
};

4️⃣ app.js
// ========== VARIÁVEIS GLOBAIS ==========
let loginAttempts = 0;
let lockoutTime = null;
let sessionTimer = null;

let currentUser = localStorage.getItem('adminUser');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let editingProductId = null;
let currentImageUrl = '';

// ========== SEÇÕES ==========
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'admin' && !currentUser) {
        openLoginModal();
        showSection('colecao');
    }
}

// ========== LOGIN COM SEGURANÇA ==========
function login(event) {
    event.preventDefault();

    // Verificar lockout
    if (lockoutTime && Date.now() - lockoutTime < SECURITY_CONFIG.lockoutDuration) {
        const remainingTime = Math.ceil((SECURITY_CONFIG.lockoutDuration - (Date.now() - lockoutTime)) / 1000);
        showLoginMessage(`❌ Muitas tentativas! Tente novamente em ${remainingTime}s`, 'error');
        return;
    }

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Hash da senha inserida
    const enteredPasswordHash = CryptoJS.SHA256(password).toString();

    if (email === ADMIN_EMAIL && enteredPasswordHash === CORRECT_PASSWORD_HASH) {
        loginAttempts = 0;
        lockoutTime = null;

        // Gera token de sessão seguro
        const sessionToken = CryptoJS.lib.WordArray.random(32).toString();
        localStorage.setItem('adminUser', email);
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.setItem('sessionStart', Date.now());

        currentUser = email;
        closeLoginModal();
        startSessionTimer();
        showLoginMessage('✅ Login realizado com sucesso!', 'success');

        setTimeout(() => {
            showSection('admin');
            loadAdminProducts();
        }, 1000);
    } else {
        loginAttempts++;
        if (loginAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
            lockoutTime = Date.now();
            showLoginMessage('❌ Muitas tentativas! Bloqueado por 15 minutos', 'error');
        } else {
            showLoginMessage(`❌ Email ou senha incorretos (${loginAttempts}/${SECURITY_CONFIG.maxLoginAttempts})`, 'error');
        }
    }
}

function showLoginMessage(text, type) {
    const msg = document.getElementById('loginMessage');
    msg.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => msg.innerHTML = '', 5000);
}

function startSessionTimer() {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        logout();
        showSection('colecao');
        showMessage('🔒 Sua sessão expirou por inatividade', 'warning');
    }, SECURITY_CONFIG.sessionTimeout);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('adminUser');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('sessionStart');
    clearTimeout(sessionTimer);
    showSection('colecao');
}

// ========== MODAL FUNCTIONS ==========
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function openProductModal() {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    editingProductId = null;
    currentImageUrl = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productColors').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').classList.remove('active');
    document.getElementById('productModalTitle').textContent = 'Novo Produto';
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function openCartModal() {
    updateCartUI();
    document.getElementById('cartModal').classList.add('active');
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
}

// ========== IMAGEM BASE64 ==========
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showMessage('❌ Selecione uma imagem válida', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageUrl = e.target.result;
        const preview = document.getElementById('imagePreview');
        preview.src = currentImageUrl;
        preview.style.display = 'block';
        preview.classList.add('active');
        document.getElementById('productImage').value = currentImageUrl;
    };
    reader.readAsDataURL(file);
}

// ========== PRODUTOS ==========
async function loadAdminProducts() {
    const adminContent = document.getElementById('adminContent');
    const products = JSON.parse(localStorage.getItem('almabela_products')) || [];

    if (products.length === 0) {
        adminContent.innerHTML = '<p style="text-align: center; color: var(--text-gray); padding: 40px;">Nenhum produto cadastrado</p>';
        return;
    }

    adminContent.innerHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>R$ ${parseFloat(p.price).toFixed(2)}</td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-sm btn-edit" onclick="editProduct(${p.id})">Editar</button>
                                <button class="btn-sm btn-delete" onclick="deleteProduct(${p.id})">Deletar</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function saveProduct(event) {
    event.preventDefault();

    if (!currentImageUrl) {
        showMessage('❌ Selecione uma imagem', 'error');
        return;
    }

    const productData = {
        id: editingProductId || Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image_url: currentImageUrl,
        colors: document.getElementById('productColors').value.split(',').map(c => c.trim())
    };

    let products = JSON.parse(localStorage.getItem('almabela_products')) || [];

    if (editingProductId) {
        products = products.map(p => p.id === editingProductId ? productData : p);
        showMessage('✅ Produto atualizado!', 'success');
    } else {
        products.push(productData);
        showMessage('✅ Produto criado!', 'success');
    }

    localStorage.setItem('almabela_products', JSON.stringify(products));
    closeProductModal();
    loadAdminProducts();
    loadProducts();
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('almabela_products')) || [];
    const product = products.find(p => p.id === id);

    if (!product) return;

    editingProductId = id;
    currentImageUrl = product.image_url;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productColors').value = product.colors.join(', ');

    const preview = document.getElementById('imagePreview');
    preview.src = product.image_url;
    preview.style.display = 'block';
    preview.classList.add('active');

    document.getElementById('productModalTitle').textContent = 'Editar Produto';
    document.getElementById('productModal').classList.add('active');
}

function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    let products = JSON.parse(localStorage.getItem('almabela_products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('almabela_products', JSON.stringify(products));

    showMessage('✅ Produto deletado!', 'success');
    loadAdminProducts();
    loadProducts();
}

function showMessage(text, type) {
    const msg = document.getElementById('adminMessage');
    if (!msg) return;
    msg.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => msg.innerHTML = '', 4000);
}

async function loadProducts() {
    const products = JSON.parse(localStorage.getItem('almabela_products')) || [];
    const grid = document.getElementById('productsGrid');

    if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 40px;">Nenhum produto</p>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image-wrapper">
                <img src="${product.image_url}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image_url.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
                    Adicionar
                </button>
            </div>
        </div>
    `).join('');
}

function addToCart(id, name, price, image) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showMessage('✅ Adicionado ao carrinho!', 'success');
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function updateCartUI() {
    const list = document.getElementById('cartItemsList');

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-gray); padding: 40px;">Carrinho vazio</p>';
        document.getElementById('cartTotal').textContent = 'R$ 0,00';
        return;
    }

    list.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">R$ ${item.price.toFixed(2)} x${item.quantity}</div>
                <button class="btn btn-secondary btn-sm" onclick="removeFromCart(${idx})">Remover</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        showMessage('Carrinho vazio!', 'error');
        return;
    }

    let message = '🛍️ Novo Pedido - Alma Bela\n\n';
    message += 'Produtos:\n';
    cart.forEach((item, i) => {
        message += `${i + 1}. ${item.name}\n`;
        message += `   R$ ${item.price.toFixed(2)} x ${item.quantity}\n`;
    });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: R$ ${total.toFixed(2)}\n\n✨ Obrigado!`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
    closeCartModal();
}

function toggleMenu() {
    const nav = document.getElementById('navMenu');
    nav.classList.toggle('active');
}

// ========== CLOSE MODALS ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('cartModal').classList.remove('active');
        document.getElementById('productModal').classList.remove('active');
        document.getElementById('loginModal').classList.remove('active');
    }
});

document.addEventListener('click', (e) => {
    if (e.target.id === 'cartModal') closeCartModal();
    if (e.target.id === 'productModal') closeProductModal();
    if (e.target.id === 'loginModal') closeLoginModal();
});

// ========== INIT ==========
loadProducts();
updateCartCount();
document.body.removeAttribute('unresolved');
