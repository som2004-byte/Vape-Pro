require('dotenv').config();
const { sendAdminNewOrderEmail } = require('../utils/email');

const testAdminEmail = async () => {
    console.log('--- ADMIN EMAIL TEST START ---');
    console.log('Checking ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
    console.log('Checking SMTP_USER:', process.env.SMTP_USER);

    // Mock Order Data
    const mockOrder = {
        _id: 'TEST_ORDER_99999',
        total: 1299,
        paymentMethod: 'COD',
        items: [
            { name: 'Test Product 1', quantity: 1, price: 1299 }
        ],
        note: 'This is a test notification'
    };

    const mockUser = {
        name: 'Test Customer',
        email: 'customer@test.com'
    };

    try {
        console.log('Calling sendAdminNewOrderEmail...');
        const success = await sendAdminNewOrderEmail(mockOrder, mockUser);

        if (success) {
            console.log('✅ TEST PASSED: Function returned success.');
            console.log('Check your email inbox (and Spam/Trash) for: ' + process.env.ADMIN_EMAIL);
        } else {
            console.log('❌ TEST FAILED: Function returned false.');
        }
    } catch (error) {
        console.error('❌ TEST CRASHED:', error.message);
        console.error(error.stack);
    }
};

testAdminEmail();
