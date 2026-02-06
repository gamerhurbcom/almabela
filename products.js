const SAMPLE_PRODUCTS = [
    {
        name: 'Body Premium Preto',
        category: 'Lingerie',
        price: 89.90,
        image_url: 'https://res.cloudinary.com/dxvrzazxk/image/upload/v1/alma_bela/body_preto.jpg',
        colors: ['Preto', 'Branco', 'Rosê'],
        active: true
    },
    {
        name: 'Gel Corporal Sensual',
        category: 'Gel',
        price: 45.90,
        image_url: 'https://res.cloudinary.com/dxvrzazxk/image/upload/v1/alma_bela/gel_sensual.jpg',
        colors: ['Transparente'],
        active: true
    },
    {
        name: 'Vibrador Discreto',
        category: 'Brinquedos',
        price: 129.90,
        image_url: 'https://res.cloudinary.com/dxvrzazxk/image/upload/v1/alma_bela/vibrador.jpg',
        colors: ['Rosê', 'Preto'],
        active: true
    },
    {
        name: 'Conjunto Lingerie Delicado',
        category: 'Lingerie',
        price: 159.90,
        image_url: 'https://res.cloudinary.com/dxvrzazxk/image/upload/v1/alma_bela/conjunto_lingerie.jpg',
        colors: ['Preto', 'Branco', 'Nude'],
        active: true
    },
    {
        name: 'Colar Sensual Premium',
        category: 'Acessórios',
        price: 79.90,
        image_url: 'https://res.cloudinary.com/dxvrzazxk/image/upload/v1/alma_bela/colar.jpg',
        colors: ['Dourado', 'Prateado'],
        active: true
    },
    {
        name: 'Máscara Elegante',
        category: 'Acessórios',
        price: 59.90,
        image_url: 'https://res.cloudinary.com/dxvrzazxk/image/upload/v1/alma_bela/mascara.jpg',
        colors: ['Preto', 'Vermelho'],
        active: true
    }
];

// Função para pré-carregar produtos (execute uma vez no console)
async function loadSampleProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('count');

        if (error) throw error;

        if (data && data.length === 0) {
            const { error: insertError } = await supabase
                .from('products')
                .insert(SAMPLE_PRODUCTS);

            if (insertError) throw insertError;
            console.log('✅ Produtos de exemplo carregados com sucesso!');
            location.reload();
        } else {
            console.log('ℹ️ Produtos já existem no banco');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
    }
}
