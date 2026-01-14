require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vapepro', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Get input if not provided via args
        const args = process.argv.slice(2);
        let email = args[0];
        let password = args[1];
        let name = args[2] || 'Admin';

        if (!email) {
            email = await new Promise(resolve => rl.question('Enter Admin Email: ', resolve));
        }
        if (!password) {
            password = await new Promise(resolve => rl.question('Enter Admin Password: ', resolve));
        }

        if (!email || !password) {
            console.error('Email and password are required.');
            process.exit(1);
        }

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            console.log('ℹ️  Admin user with this email already exists');
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${email}`);
        // console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
