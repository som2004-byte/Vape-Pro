require('dotenv').config();
const { sendOrderConfirmationEmail } = require('../utils/email');
const fs = require('fs');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('test-order-email-result.txt', msg + '\n');
};

const testOrderEmail = async () => {
    fs.writeFileSync('test-order-email-result.txt', 'Starting Order Email Test...\n');

    log('Testing Order Confirmation Email...');

    // Mock Order Data
    const mockOrder = {
        _id: 'ORDER123456789',
        totalPrice: 4500,
        status: 'Processing',
        paymentMethod: 'cod',
        items: [
            { name: 'Vape Pen Pro', quantity: 1, price: 2500 },
            { name: 'E-Liquid Menthol', quantity: 2, price: 1000 }
        ]
    };

    const testRecipient = process.env.ADMIN_EMAIL; // Send to admin for safety

    if (!testRecipient) {
        log('❌ ADMIN_EMAIL not set in .env');
        return;
    }

    log(`Sending test order email to: ${testRecipient}`);

    try {
        const success = await sendOrderConfirmationEmail(testRecipient, mockOrder);

        if (success) {
            log('✅ Order confirmation email sent successfully!');
        } else {
            log('❌ Failed to send order confirmation email (Function returned false or void).');
        }
    } catch (e) {
        log('❌ Exception: ' + e.message);
        log(e.stack);
    }
};

testOrderEmail();
