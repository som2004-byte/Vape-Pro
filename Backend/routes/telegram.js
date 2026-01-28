const express = require('express');
const { authorizeAdmin } = require('../middleware/auth');
const { sendTelegramNotification } = require('../utils/telegram');

const router = express.Router();

// Protected test endpoint for admins to send a Telegram message
router.post('/test', authorizeAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    const text = message || 'Test message from Vape-Pro server';

    // sendTelegramNotification is non-blocking but we'll call it and return success
    sendTelegramNotification(text);

    res.json({ ok: true, message: 'Telegram test message queued' });
  } catch (err) {
    console.error('Telegram test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Protected endpoint to fetch recent updates and return chat id
router.get('/fetch-chat-id', authorizeAdmin, async (req, res) => {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) return res.status(500).json({ error: 'Bot token not configured' });

    const https = require('https');
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;

    https.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.ok) return res.status(500).json({ error: json.description || 'API error' });
          const updates = json.result || [];
          if (updates.length === 0) return res.json({ ok: true, message: 'No updates found' });
          const chat = updates[updates.length - 1].message.chat;
          return res.json({ ok: true, chatId: chat.id, chat });
        } catch (e) {
          return res.status(500).json({ error: 'Failed to parse response', detail: e.message });
        }
      });
    }).on('error', (e) => {
      return res.status(500).json({ error: 'Request error', detail: e.message });
    });
  } catch (err) {
    console.error('Fetch chat id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
