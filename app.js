let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let editingProductId = null;
let adminAccessKey = '';
let currentImageUrl = '';

async function init() {
    await loadProducts();
    checkAdminStatus();
    updateCartUI();
    setupAdminSecretAccess();
    setupImageUpload();
    document.body.removeAttribute('unresolved');
}

function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent)';
        uploadArea.style.background = '#f0ebe8';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'var(--light-hover)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageSelect({ target: { files } });
        }
    });
}

async function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showMessage('Por favor, selecione uma imagem válida', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando imagem...';

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
        formData.append('cloud_name', CLOUDINARY_CONFIG.cloud_name);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Erro no upload');

        const data = await response.json();
        currentImageUrl = data.secure_url;

        const preview = document.getElementById('imagePreview');
        preview.src = currentImageUrl;
        preview.classList.add('active');

        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.add('has-image');

        document.getElementById('productImage').value = currentImageUrl;
        showMessage('Imagem enviada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro no upload:', error);
        showMessage('Erro ao enviar imagem. Tente novamente.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar Produto';
    }
}

function setupAdminSecretAccess() {
    const logo = document.getElementById('logoLink');
    let clicks = 0;

    logo.addEventListener('click', (e) => {
        if (adminAccessKey.length < 5) return;
        clicks++;
        if (clicks === 5) {
            document.getElementById('loginModal').classList.add('active');
            clicks = 0;
        }
        setTimeout(() => clicks = 0, 3000);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'a' && e.ctrlKey) {
            e.preventDefault();
            adminAccessKey = 'admin';
        }
    });
}

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const grid = document.getElementById('productsGrid');
        if (!data || data.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 40px;">Nenhum produto disponível</p>';
        } else {
            grid.innerHTML = (data || []).map(product => {
                const colors = typeof product.colors === 'string' 
                    ? product.colors.split(',').map(c => c.trim())
                    : product.colors || [];
                
                return `
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="${product.image_url}" alt="${product.name}" class="product-image" loading="lazy">
                        </div>
                        <div class="product-info">
                            <div class="product-category">${product.category}</div>
                            <div class="product-name">${product.name}</div>
                            <div class="product-colors">
                                ${colors.map(color => `
                                    <div class="color-dot" style="background: ${getColorCode(color)};" title="${color}"></div>
                                `).join('')}
                            </div>
                            <div class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</div>
                            <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image_url.replace(/'/g, "\\'")}')">
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

function getColorCode(colorName) {
    const colors = {
        'Rosê': '#d4927d',
        'Preto': '#1a1a1a',
        'Branco': '#f5f5f5',
        'Bege': '#c9a17a',
        'Roxo': '#8b6b7a',
        'Champagne': '#e8d4c0',
        'Nude': '#d9b8a5',
        'Vermelho': '#c41e3a'
    };
    return colors[colorName] || '#c9a17a';
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
}

function updateCartUI() {
    const count = document.getElementById('cartCount');
    count.textContent = cart.length;

    const list = document.getElementById('cartItemsList');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = '<div class="loading">Carrinho vazio</div>';
        document.getElementById('cartTotal').textContent = 'R$ 0,00';
    } else {
        list.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <button class="btn btn-delete btn-sm" onclick="removeFromCart(${idx})">Remover</button>
                </div>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2)}`;
    }
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

    let message = 'Novo Pedido - Alma Bela\n\n';
    message += 'Produtos:\n';
    cart.forEach((item, i) => {
        message += `${i + 1}. ${item.name}\n`;
        message += `   R$ ${item.price.toFixed(2)} x ${item.quantity}\n`;
    });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: R$ ${total.toFixed(2)}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    closeCartModal();
}

function switchView(view) {
    if (view === 'admin') {
        if (!currentUser) {
            document.getElementById('loginModal').classList.add('active');
            return;
        }
        document.getElementById('storeView').classList.remove('active');
        document.getElementById('adminPanel').classList.add('active');
        loadAdminProducts();
    } else {
        document.getElementById('adminPanel').classList.remove('active');
        document.getElementById('storeView').classList.add('active');
    }
}

function checkAdminStatus() {
    currentUser = localStorage.getItem('adminUser');
}

function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminUser', email);
        currentUser = email;
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        switchView('admin');
    } else {
        showMessage('Email ou senha incorretos', 'error');
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    switchView('store');
}

async function loadAdminProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const content = document.getElementById('adminContent');
        content.innerHTML = `
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
                    ${(data || []).map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.category}</td>
                            <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
                            <td>
                                <div class="action-btns">
                                    <button class="btn-sm btn-edit" onclick="editProduct(${product.id})">Editar</button>
                                    <button class="btn-sm btn-delete" onclick="deleteProduct(${product.id})">Deletar</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erro:', error);
    }
}

function openProductModal() {
    editingProductId = null;
    currentImageUrl = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productColors').value = '';
    document.getElementById('imagePreview').classList.remove('active');
    document.getElementById('uploadArea').classList.remove('has-image');
    document.getElementById('productModalTitle').textContent = 'Novo Produto';
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

async function saveProduct(event) {
    event.preventDefault();

    if (!currentImageUrl) {
        showMessage('Por favor, selecione uma imagem', 'error');
        return;
    }

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image_url: currentImageUrl,
        colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
        active: true
    };

    try {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';

        if (editingProductId) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProductId);
            if (error) throw error;
            showMessage('Produto atualizado com sucesso!', 'success');
        } else {
            const { error } = await supabase
                .from('products')
                .insert([productData]);
            if (error) throw error;
            showMessage('Produto criado com sucesso!', 'success');
        }

        closeProductModal();
        await loadAdminProducts();
        await loadProducts();
    } catch (error) {
        showMessage('Erro ao salvar produto: ' + error.message, 'error');
    } finally {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar Produto';
    }
}

async function editProduct(id) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        editingProductId = id;
        currentImageUrl = data.image_url;
        document.getElementById('productName').value = data.name;
        document.getElementById('productCategory').value = data.category;
        document.getElementById('productPrice').value = data.price;
        document.getElementById('productImage').value = data.image_url;
        document.getElementById('productColors').value = (data.colors || []).join(', ');
        
        const preview = document.getElementById('imagePreview');
        preview.src = data.image_url;
        preview.classList.add('active');
        document.getElementById('uploadArea').classList.add('has-image');

        document.getElementById('productModalTitle').textContent = 'Editar Produto';
        document.getElementById('productModal').classList.add('active');
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar produto', 'error');
    }
}

async function deleteProduct(id) {
    const confirmed = confirm('Tem certeza que deseja deletar este produto?');
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('products')
            .update({ active: false })
            .eq('id', id);

        if (error) throw error;
        showMessage('Produto deletado com sucesso!', 'success');
        await loadAdminProducts();
        await loadProducts();
    } catch (error) {
        showMessage('Erro ao deletar: ' + error.message, 'error');
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('adminMessage');
    msg.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => msg.innerHTML = '', 4000);
}

document.getElementById('cartBtn').addEventListener('click', () => {
    updateCartUI();
    document.getElementById('cartModal').classList.add('active');
});

document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') {
        closeLoginModal();
    }
});

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('cartModal').classList.remove('active');
        document.getElementById('productModal').classList.remove('active');
        document.getElementById('loginModal').classList.remove('active');
    }
});

init();
