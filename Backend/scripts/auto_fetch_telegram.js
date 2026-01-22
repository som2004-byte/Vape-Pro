const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN || '8580884454:AAFmTbX6JA_2do_lZuyjwutGPWFuNxHewm8';
const url = `https://api.telegram.org/bot${token}/getUpdates`;

console.log(`Checking updates for bot...`);

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (!response.ok) {
                console.error('Error:', response.description);
                return;
            }

            const updates = response.result;
            if (updates.length > 0) {
                // Find the most recent message
                const lastUpdate = updates[updates.length - 1];
                const chat = lastUpdate.message.chat;
                const chatId = chat.id;
                const name = chat.first_name;

                console.log(`FOUND_CHAT_ID: ${chatId}`);
                console.log(`USER_NAME: ${name}`);
            } else {
                console.log('NO_MESSAGES_FOUND');
            }
        } catch (e) {
            console.error('Parse Error:', e.message);
        }
    });
}).on('error', (e) => {
    console.error('Connection Error:', e.message);
});
