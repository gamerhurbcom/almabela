// ========== SEGURANÇA ==========
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
    updateCartUI();
    showMessage('✅ Adicionado ao carrinho!', 'success');
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
    updateCartUI();
    closeCartModal();
}

function toggleMenu() {
    const nav = document.querySelector('.nav');
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
document.body.removeAttribute('unresolved');
