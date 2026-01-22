const https = require('https');

/**
 * Sends a notification message to the configured Telegram chat.
 * @param {string} message - The message to send (supports Markdown).
 */
const sendTelegramNotification = (message) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram not configured, skipping notification');
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    });

    const req = https.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, (res) => {
        // Consume response data to free up memory
        res.on('data', () => { });

        if (res.statusCode !== 200) {
            console.warn(`Telegram API returned status code: ${res.statusCode}`);
        }
    });

    req.on('error', (e) => {
        console.error('Telegram Notification Error:', e);
    });

    req.write(data);
    req.end();
};

module.exports = { sendTelegramNotification };
