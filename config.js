// Configuração Supabase
const SUPABASE_URL = 'https://ibpwciwmypovtivnskvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicHdjaXdteXBvdnRpdm5za3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA3OTgsImV4cCI6MjA4NTkwNjc5OH0.A0HTRFK0rN0trL8A1F-107smvA2TxYIoopHqQ6fvyeU';

// Configuração Cloudinary
const CLOUDINARY_CONFIG = {
    cloud_name: 'dxvrzazxk',
    upload_preset: 'alma_bela_upload'
};

// Credenciais Admin
const ADMIN_CREDENTIALS = {
    email: 'admin@almaabela.com',
    password: 'admin123'
};

// WhatsApp
const WHATSAPP_NUMBER = '5511999999999';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

