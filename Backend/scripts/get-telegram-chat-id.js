const https = require('https');
const readline = require('readline');

// Auto-detected token
const AUTO_TOKEN = '8580884454:AAFmTbX6JA_2do_lZuyjwutGPWFuNxHewm8';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
=================================================
🤖 Vape-Pro Telegram Setup
=================================================
Token: ${AUTO_TOKEN}
`);

console.log(`
👉 ACTION REQUIRED:
1. Open Telegram
2. Search for "@VapesmartBot"
3. Click "START" or send the message "Hello"
`);

rl.question('Press ENTER once you have sent the message...', () => {
    getUpdates(AUTO_TOKEN);
});

function getUpdates(token) {
    console.log('🔄 Checking for messages...');
    const url = `https://api.telegram.org/bot${token}/getUpdates`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (!response.ok) {
                    console.error('❌ API Error:', response.description);
                    rl.close();
                    return;
                }

                const updates = response.result;
                if (updates.length === 0) {
                    console.log('⚠️ No messages found. Did you send "Hello" to your bot?');
                    console.log('Trying again in 3 seconds...');
                    setTimeout(() => getUpdates(token), 3000);
                    return;
                }

                const chat = updates[updates.length - 1].message.chat;
                console.log(`
🎉 SUCCESS! FOUND IT!
=================================================
Your Chat ID is: ${chat.id}

Now, open your "Backend/.env" file and paste this line at the bottom:
TELEGRAM_CHAT_ID=${chat.id}

(Or run this script again after adding it to verify)
=================================================
`);
                rl.close();

            } catch (e) {
                console.error('❌ Error parsing response:', e.message);
                rl.close();
            }
        });

    }).on('error', (e) => {
        console.error('❌ Connection error:', e.message);
        rl.close();
    });
}
