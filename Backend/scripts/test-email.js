require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'test-email-result.txt');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

const testEmail = async () => {
    fs.writeFileSync(logFile, 'Starting Test...\n');
    log('Testing Email Configuration...');
    log('SMTP_HOST: ' + process.env.SMTP_HOST);
    log('SMTP_USER: ' + process.env.SMTP_USER);
    log('ADMIN_EMAIL: ' + process.env.ADMIN_EMAIL);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Test Email from Vape-Pro Debugger',
            text: 'If you receive this, your email configuration is working correctly.',
        });

        log('✅ Email sent successfully!');
        log('Message ID: ' + info.messageId);
    } catch (error) {
        log('❌ Failed to send email:');
        log(error.message);
        if (error.code) log('Code: ' + error.code);
        if (error.response) log('Response: ' + error.response);
    }
};

testEmail();
