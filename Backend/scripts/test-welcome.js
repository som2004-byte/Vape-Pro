require('dotenv').config();
const { sendWelcomeEmail } = require('../utils/email');
const fs = require('fs');

const log = (msg) => {
    // Console log might appear empty in some execution environments
    // but writing to file is reliable
    console.log(msg);
    fs.appendFileSync('test-welcome-result.txt', msg + '\n');
};

const testWelcomeEmail = async () => {
    // Clear previous log
    fs.writeFileSync('test-welcome-result.txt', 'Starting Test...\n');

    log('Testing Welcome Email...');
    log('SMTP Config: ' + JSON.stringify({
        host: process.env.SMTP_HOST || 'MISSING',
        user: process.env.SMTP_USER || 'MISSING',
        from: process.env.SMTP_FROM || 'MISSING'
    }));

    const testRecipient = process.env.ADMIN_EMAIL; // Send to admin for safety

    if (!testRecipient) {
        log('❌ ADMIN_EMAIL not set in .env');
        return;
    }

    log(`Sending test welcome email to: ${testRecipient}`);

    try {
        const success = await sendWelcomeEmail(testRecipient, 'Test User');

        if (success) {
            log('✅ Welcome email sent successfully!');
        } else {
            log('❌ Failed to send welcome email (Function returned false).');
        }
    } catch (e) {
        log('❌ Exception: ' + e.message);
    }
};

testWelcomeEmail();
