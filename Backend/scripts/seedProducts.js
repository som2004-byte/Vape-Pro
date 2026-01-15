require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
    // ========== ELFBAR Moonlight 40K Series ==========
    {
        sku: "elfbar-moonlight-40k-blackberry-ice",
        name: "ELFBAR Moonlight 40K - Blackberry Ice",
        brand: "ELFBAR",
        description: "Series: Moonlight 40K. Flavor: Blackberry Ice. Type: Rechargeable Disposable. Puffs: 40000. Nicotine: 5%. Features: 3-Level Adjustable Power.",
        category: "disposable",
        flavor: "Blackberry Ice",
        price: 2399,
        originalPrice: 3000,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/elfbar-moonlight-40k/blackberry-ice.png"],
        specifications: { series: "Moonlight 40K", puffs: "40000", nicotine: "5%", type: "Rechargeable Disposable" }
    },
    // ========== ELFBAR Sweet King Series ==========
    {
        sku: "elfbar-sweet-king-kiwi-passion-guava",
        name: "ELFBAR Sweet King - Kiwi Passion Fruit Guava",
        brand: "ELFBAR",
        description: "Series: Sweet King. Flavor: Kiwi Passion Fruit Guava. Puffs: 15000. Nicotine: 5%. Features: 4 Levels Personalized Sweetness.",
        category: "disposable",
        flavor: "Kiwi Passion Fruit Guava",
        price: 2299,
        originalPrice: 3000,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/elfbar-sweet-king/kiwi-passion-guava.png"],
        specifications: { series: "Sweet King", puffs: "15000", nicotine: "5%", type: "Rechargeable Disposable" }
    },
    // ========== ELFBAR Raya D3 Series ==========
    {
        sku: "elfbar-raya-d3-grape-ice",
        name: "ELFBAR Raya D3 - Grape Ice",
        brand: "ELFBAR",
        description: "Series: Raya D3. Flavor: Grape Ice. Puffs: 25000. Nicotine: 50mg/ml.",
        category: "disposable",
        flavor: "Grape Ice",
        price: 1999,
        originalPrice: 2600,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/elfbar-raya-d3/grape-ice.png"],
        specifications: { series: "Raya D3", puffs: "25000", nicotine: "50mg/ml", type: "Disposable Pod Device" }
    },
    // ========== ELFBAR Raya D1 Series ==========
    {
        sku: "elfbar-raya-d1-blueberry",
        name: "ELFBAR Raya D1 - Blueberry",
        brand: "ELFBAR",
        description: "Series: Raya D1. Flavor: Blueberry. Puffs: 13000.",
        category: "disposable",
        flavor: "Blueberry",
        price: 1899,
        originalPrice: 2500,
        stock: 25,
        isFeatured: false,
        images: ["/images/products/elfbar-raya-d1/blueberry.png"],
        specifications: { series: "Raya D1", puffs: "13000", nicotine: "50mg/ml", type: "Disposable Pod Device" }
    },
    // ========== YUOTO Thanos Series ==========
    {
        sku: "yuoto-thanos-double-apple",
        name: "YUOTO Thanos - Double Apple",
        brand: "YUOTO",
        description: "Series: Thanos. Flavor: Double Apple. Puffs: 5000.",
        category: "disposable",
        flavor: "Double Apple",
        price: 1299,
        originalPrice: 2000,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/yuoto-thanos/double-apple.png"],
        specifications: { series: "Thanos", puffs: "5000", nicotine: "5%", type: "Disposable" }
    },
    // ========== IGET Disposable Series ==========
    {
        sku: "iget-disposable-strawberry-ice",
        name: "IGET Disposable - Strawberry Ice",
        brand: "IGET",
        description: "Series: Disposable. Flavor: Strawberry Ice. Puffs: 10000.",
        category: "disposable",
        flavor: "Strawberry Ice",
        price: 1899,
        originalPrice: 2400,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/iget-disposable/strawberry-ice.png"],
        specifications: { series: "Disposable", puffs: "10000", nicotine: "5%", type: "Disposable Pod Device" }
    },
    // ========== ELFWORLD MX25000 Series ==========
    {
        sku: "elfworld-mx25000-grape-ice",
        name: "ELFWORLD MX25000 - Grape Ice",
        brand: "ELFWORLD",
        description: "Series: MX25000. Flavor: Grape Ice. Puffs: 25000.",
        category: "disposable",
        flavor: "Grape Ice",
        price: 1999,
        originalPrice: 2600,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/elfworld-mx25000/grape-ice.png"],
        specifications: { series: "MX25000", puffs: "25000", nicotine: "5%", type: "Disposable" }
    },
    // ========== UWELL Caliburn Series (PODKITS) ==========
    {
        sku: "uwell-caliburn-g4-pro-koko",
        name: "UWELL Caliburn G4 Pro KOKO",
        brand: "UWELL",
        description: "Series: Caliburn G4 Pro KOKO. Type: Pod System.",
        category: "podkits",
        price: 5199,
        originalPrice: 7000,
        stock: 10,
        isFeatured: true,
        images: ["/images/products/uwell-caliburn/g4-pro-koko.png"],
        specifications: { series: "Caliburn G4 Pro KOKO", type: "Pod System", battery: "2000 mAh" }
    }
];

const seedDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI is not defined in .env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        await Product.insertMany(products);
        console.log(`Seeded ${products.length} products successfully`);

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
