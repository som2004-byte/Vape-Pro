const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, brand, search } = req.query;
        const query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (brand) {
            query.brand = brand;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { flavor: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true }).limit(10);
        res.json(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
