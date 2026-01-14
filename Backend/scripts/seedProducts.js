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
        price: 1799,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/elfbar-moonlight-40k/blackberry-ice.png"],
        specifications: {
            series: "Moonlight 40K",
            puffs: "40000",
            nicotine: "5%",
            type: "Rechargeable Disposable"
        }
    },
    {
        sku: "elfbar-moonlight-40k-kiwi-passion-guava",
        name: "ELFBAR Moonlight 40K - Kiwi Passion Fruit Guava",
        brand: "ELFBAR",
        description: "Series: Moonlight 40K. Flavor: Kiwi Passion Fruit Guava. Type: Rechargeable Disposable. Puffs: 40000. Nicotine: 5%. Features: 3-Level Adjustable Power.",
        category: "disposable",
        flavor: "Kiwi Passion Fruit Guava",
        price: 1799,
        stock: 25,
        isFeatured: false,
        images: ["/images/products/elfbar-moonlight-40k/kiwi-passion-guava.png"],
        specifications: {
            series: "Moonlight 40K",
            puffs: "40000",
            nicotine: "5%",
            type: "Rechargeable Disposable"
        }
    },
    // ========== ELFBAR Raya D3 Series ==========
    {
        sku: "elfbar-raya-d3-grape-ice",
        name: "ELFBAR Raya D3 - Grape Ice",
        brand: "ELFBAR",
        description: "Series: Raya D3. Flavor: Grape Ice. Type: Disposable Pod Device. Puffs: 25000. Nicotine: 50mg/ml. Features: 1st Triple Mesh Coil | 3 Modes (Lite, Smooth, Turbo).",
        category: "disposable",
        flavor: "Grape Ice",
        price: 1599,
        stock: 25,
        isFeatured: true,
        images: ["/images/products/elfbar-raya-d3/grape-ice.png"],
        specifications: {
            series: "Raya D3",
            puffs: "25000",
            nicotine: "50mg/ml",
            type: "Disposable Pod Device"
        }
    },
    // ========== UWELL Caliburn Series ==========
    {
        sku: "uwell-caliburn-g4-pro-koko",
        name: "UWELL Caliburn G4 Pro KOKO",
        brand: "UWELL",
        description: "Series: Caliburn G4 Pro KOKO. Type: Pod System. Nicotine: Variable. Features: 2000 mAh | 2.0 Inch Touch | G Pod Platform.",
        category: "pod-systems",
        price: 3499,
        stock: 10,
        isFeatured: true,
        images: ["/images/products/uwell-caliburn/g4-pro-koko.png"],
        specifications: {
            series: "Caliburn G4 Pro KOKO",
            type: "Pod System",
            battery: "2000 mAh"
        }
    }
];

const seedDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI is not defined in .env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        await Product.insertMany(products);
        console.log(`Seeded ${products.length} products successfully`);

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
