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
