const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database simulation (in production, use a real database like MongoDB or PostgreSQL)
const ordersFile = path.join(__dirname, 'data', 'orders.json');
const certificatesFile = path.join(__dirname, 'data', 'certificates.json');
const usersFile = path.join(__dirname, 'data', 'users.json');

// Initialize data files
async function initializeDataFiles() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.mkdir(dataDir, { recursive: true });
        
        // Check if files exist, if not create them
        try {
            await fs.access(ordersFile);
        } catch {
            await fs.writeFile(ordersFile, JSON.stringify([]));
        }
        
        try {
            await fs.access(certificatesFile);
        } catch {
            await fs.writeFile(certificatesFile, JSON.stringify([]));
        }
        
        try {
            await fs.access(usersFile);
        } catch {
            // Create default users
            const defaultUsers = [
                { id: '1', username: 'admin', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() },
                { id: '2', username: 'demo', password: 'demo123', role: 'user', createdAt: new Date().toISOString() }
            ];
            await fs.writeFile(usersFile, JSON.stringify(defaultUsers, null, 2));
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Email Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com', // Or use Gmail: smtp.gmail.com
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'your-email@outlook.com', // Set in .env file
        pass: process.env.EMAIL_PASS || 'your-password'           // Set in .env file
    }
});

// Email sending function
async function sendOrderNotification(order) {
    const planEmojis = {
        'standard': '✅',
        'instant': '⚡',
        'premium': '👑'
    };
    
    const planNames = {
        'standard': 'Standard',
        'instant': 'Instant',
        'premium': 'Premium'
    };
    
    // Email to admin (fucksubs@proton.me)
    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: 'fucksubs@proton.me',
        subject: `🎉 Nouvelle Commande #${order.id.slice(-8)} - ${planNames[order.planType]} (${order.price}€)`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #f5f5f5;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .order-info {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: 600;
                        color: #666;
                    }
                    .value {
                        color: #333;
                        font-weight: 600;
                    }
                    .price {
                        font-size: 32px;
                        color: #30D158;
                        font-weight: 700;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .badge {
                        display: inline-block;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 700;
                        text-transform: uppercase;
                    }
                    .badge-promo {
                        background: linear-gradient(135deg, #FF6B6B, #FFD700);
                        color: #000;
                    }
                    .badge-premium {
                        background: linear-gradient(135deg, #FFD700, #FFA500);
                        color: #000;
                    }
                    .badge-instant {
                        background: linear-gradient(135deg, #FFD60A, #FFC107);
                        color: #000;
                    }
                    .badge-standard {
                        background: linear-gradient(135deg, #30D158, #28A745);
                        color: #000;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #999;
                        font-size: 12px;
                    }
                    .action-required {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Nouvelle Commande !</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">FuckSubs - iOS Certificates</p>
                    </div>
                    
                    <div class="content">
                        <div class="price">${order.price}€</div>
                        
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span class="badge badge-${order.planType}">
                                ${planEmojis[order.planType]} ${planNames[order.planType]}
                            </span>
                            ${order.isLaunchPromo ? '<span class="badge badge-promo" style="margin-left: 10px;">🎉 OFFRE LANCEMENT</span>' : ''}
                        </div>
                        
                        ${order.isLaunchPromo ? `
                        <div class="action-required">
                            <strong>⚠️ Offre de lancement appliquée !</strong><br>
                            Client a payé ${order.price}€ mais reçoit le certificat Premium (60€)
                        </div>
                        ` : ''}
                        
                        <div class="order-info">
                            <div class="info-row">
                                <span class="label">ID Commande</span>
                                <span class="value">#${order.id}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Email Client</span>
                                <span class="value">${order.email}</span>
                            </div>
                            ${order.username ? `
                            <div class="info-row">
                                <span class="label">Compte Utilisateur</span>
                                <span class="value">@${order.username}</span>
                            </div>
                            ` : ''}
                            <div class="info-row">
                                <span class="label">UDID</span>
                                <span class="value" style="font-family: monospace; font-size: 12px;">${order.udid}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Appareil</span>
                                <span class="value">${order.deviceName}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Type de Plan</span>
                                <span class="value">${planNames[order.planType]}</span>
                            </div>
                            ${order.originalPlanType !== order.planType ? `
                            <div class="info-row">
                                <span class="label">Plan Commandé</span>
                                <span class="value">${planNames[order.originalPlanType]}</span>
                            </div>
                            ` : ''}
                            <div class="info-row">
                                <span class="label">Protection Révocation</span>
                                <span class="value">${order.revocationProtection ? '🔒 Oui (Premium)' : '⚠️ Non'}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Date</span>
                                <span class="value">${new Date(order.createdAt).toLocaleString('fr-FR')}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Expiration</span>
                                <span class="value">${order.expiryDate}</span>
                            </div>
                        </div>
                        
                        <div class="action-required">
                            <strong>📋 Actions à effectuer :</strong>
                            <ol style="margin: 10px 0 0; padding-left: 20px;">
                                <li>Ajouter l'UDID au compte développeur Apple</li>
                                <li>Générer le certificat ${order.isPremium ? 'Premium (officiel)' : 'Standard'}</li>
                                <li>Envoyer les fichiers au client (${order.email})</li>
                                <li>Marquer la commande comme "completed" dans le dashboard</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement par le système FuckSubs</p>
                        <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    // Email to customer (optional)
    const customerMailOptions = {
        from: process.env.EMAIL_USER,
        to: order.email,
        subject: `✅ Commande confirmée - FuckSubs #${order.id.slice(-8)}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #f5f5f5;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }
                    .content {
                        padding: 30px;
                    }
                    .success-icon {
                        font-size: 64px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .info-box {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .badge {
                        display: inline-block;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 700;
                        text-transform: uppercase;
                        margin: 10px 5px;
                    }
                    .badge-promo {
                        background: linear-gradient(135deg, #FF6B6B, #FFD700);
                        color: #000;
                    }
                    .badge-premium {
                        background: linear-gradient(135deg, #FFD700, #FFA500);
                        color: #000;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Commande Confirmée !</h1>
                    </div>
                    
                    <div class="content">
                        <div class="success-icon">🎉</div>
                        
                        <h2 style="text-align: center; color: #333;">Merci pour votre commande !</h2>
                        
                        ${order.isLaunchPromo ? `
                        <div style="background: linear-gradient(135deg, #FF6B6B, #FFD700); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h3 style="margin: 0; color: #000;">🎉 FÉLICITATIONS !</h3>
                            <p style="margin: 10px 0 0; color: #000; font-weight: 600;">
                                Votre commande a été UPGRADÉE EN PREMIUM gratuitement !<br>
                                Vous payez ${order.price}€ mais recevez le certificat Premium (60€)
                            </p>
                        </div>
                        ` : ''}
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">📋 Détails de votre commande</h3>
                            <p><strong>ID:</strong> #${order.id.slice(-8)}</p>
                            <p><strong>Plan:</strong> ${planEmojis[order.planType]} ${planNames[order.planType]}</p>
                            <p><strong>Prix:</strong> ${order.price}€</p>
                            <p><strong>Appareil:</strong> ${order.deviceName}</p>
                            ${order.isPremium ? '<p><strong>Protection:</strong> 🔒 Sans risque de révocation</p>' : ''}
                        </div>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">⏰ Prochaines étapes</h3>
                            <ol style="padding-left: 20px;">
                                <li>Votre UDID est en cours d'enregistrement (24-48h)</li>
                                <li>Vous recevrez un email avec vos fichiers de certificat</li>
                                <li>Suivez le guide d'installation fourni</li>
                                <li>Profitez de toutes vos apps premium !</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #666;">Des questions ? Répondez à cet email !</p>
                            <p style="color: #999; font-size: 12px;">Support: fucksubs@proton.me</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        // Send email to admin
        await transporter.sendMail(adminMailOptions);
        console.log('✅ Email envoyé à fucksubs@proton.me');
        
        // Send email to customer
        await transporter.sendMail(customerMailOptions);
        console.log(`✅ Email de confirmation envoyé à ${order.email}`);
        
        return true;
    } catch (error) {
        console.error('❌ Erreur envoi email:', error.message);
        return false;
    }
}

// Email when order is completed
async function sendOrderCompletedEmail(order) {
    const planEmojis = {
        'standard': '✅',
        'instant': '⚡',
        'premium': '👑'
    };
    
    const planNames = {
        'standard': 'Standard',
        'instant': 'Instant',
        'premium': 'Premium'
    };
    
    const completionEmail = {
        from: process.env.EMAIL_USER,
        to: order.email,
        subject: `🎉 Votre certificat iOS est prêt! - Commande #${order.id.slice(-8)}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #f5f5f5;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #30D158 0%, #28A745 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    .success-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .download-section {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        margin: 30px 0;
                    }
                    .download-btn {
                        display: inline-block;
                        background: white;
                        color: #667eea;
                        padding: 15px 40px;
                        border-radius: 25px;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 16px;
                        margin: 10px;
                        transition: all 0.3s ease;
                    }
                    .download-btn:hover {
                        transform: scale(1.05);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    }
                    .info-box {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .steps {
                        counter-reset: step;
                        list-style: none;
                        padding: 0;
                    }
                    .steps li {
                        counter-increment: step;
                        padding: 15px 15px 15px 50px;
                        margin: 10px 0;
                        background: #f8f9fa;
                        border-radius: 8px;
                        position: relative;
                    }
                    .steps li::before {
                        content: counter(step);
                        position: absolute;
                        left: 15px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: #667eea;
                        color: white;
                        width: 25px;
                        height: 25px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 12px;
                    }
                    .warning {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">🎉</div>
                        <h1>Votre certificat est prêt !</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Commande #${order.id.slice(-8)}</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #333;">Félicitations ${order.username ? '@' + order.username : ''} !</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Votre certificat iOS ${planEmojis[order.planType]} <strong>${planNames[order.planType]}</strong> 
                            a été généré avec succès et est maintenant prêt à être installé !
                        </p>
                        
                        ${order.isLaunchPromo ? `
                        <div style="background: linear-gradient(135deg, #FF6B6B, #FFD700); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h3 style="margin: 0; color: #000;">🎉 MERCI !</h3>
                            <p style="margin: 10px 0 0; color: #000; font-weight: 600;">
                                En tant que membre des 10 premiers, vous avez reçu le certificat Premium !
                            </p>
                        </div>
                        ` : ''}
                        
                        <div class="download-section">
                            <h3 style="color: white; margin-top: 0;">📥 Téléchargez vos fichiers</h3>
                            <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">
                                Cliquez sur les boutons ci-dessous pour télécharger vos certificats
                            </p>
                            <a href="http://localhost:3000/dashboard.html?order=${order.id}" class="download-btn">
                                📱 Accéder au Dashboard
                            </a>
                        </div>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">📋 Informations de votre commande</h3>
                            <p><strong>Plan:</strong> ${planEmojis[order.planType]} ${planNames[order.planType]}</p>
                            <p><strong>Appareil:</strong> ${order.deviceName}</p>
                            <p><strong>Expiration:</strong> ${order.expiryDate}</p>
                            ${order.isPremium ? '<p><strong>Protection:</strong> 🔒 Sans risque de révocation</p>' : ''}
                        </div>
                        
                        <h3>🚀 Installation en 3 étapes</h3>
                        <ol class="steps">
                            <li>
                                <strong>Téléchargez les fichiers</strong><br>
                                Cliquez sur le bouton ci-dessus pour accéder à votre dashboard
                            </li>
                            <li>
                                <strong>Installez le certificat</strong><br>
                                Suivez le guide d'installation fourni sur votre dashboard
                            </li>
                            <li>
                                <strong>Profitez de vos apps !</strong><br>
                                Installez toutes les apps premium disponibles
                            </li>
                        </ol>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong> Gardez ces fichiers en sécurité. 
                            Ne les partagez pas car ils sont liés à votre appareil (UDID).
                        </div>
                        
                        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0;">
                            <h3 style="color: #333;">Besoin d'aide ?</h3>
                            <p style="color: #666;">
                                Notre équipe est là pour vous aider !<br>
                                Répondez simplement à cet email.
                            </p>
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                Support: fucksubs@proton.me
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await transporter.sendMail(completionEmail);
        console.log(`✅ Email de complétion envoyé à ${order.email}`);
        return true;
    } catch (error) {
        console.error('❌ Erreur envoi email completion:', error.message);
        return false;
    }
}

// Helper functions
async function readOrders() {
    try {
        const data = await fs.readFile(ordersFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeOrders(orders) {
    await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2));
}

async function readCertificates() {
    try {
        const data = await fs.readFile(certificatesFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeCertificates(certificates) {
    await fs.writeFile(certificatesFile, JSON.stringify(certificates, null, 2));
}

async function readUsers() {
    try {
        const data = await fs.readFile(usersFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeUsers(users) {
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

// Calculate dynamic pricing
function calculateDynamicPrice(basePrice) {
    const today = new Date();
    const expiryDate = new Date('2026-11-05');
    const totalMonths = 12;
    
    const remainingTime = expiryDate - today;
    const remainingMonths = remainingTime / (1000 * 60 * 60 * 24 * 30.44);
    
    const pricePerMonth = basePrice / totalMonths;
    const dynamicPrice = Math.ceil(pricePerMonth * remainingMonths);
    
    return Math.max(dynamicPrice, 10);
}

// Routes

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
        }
        
        const users = await readUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        // In production, generate a JWT token here
        res.json({
            success: true,
            username: user.username,
            role: user.role,
            status: user.status || 'free',
            badge: user.badge || '🆓',
            purchases: user.purchases || [],
            token: 'demo_token_' + Date.now() // Replace with real JWT in production
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
        }
        
        const users = await readUsers();
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return res.status(409).json({ error: 'Cet identifiant existe déjà' });
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            password, // In production, hash the password!
            email: email || '',
            role: 'user',
            status: 'free', // free, standard, instant, premium
            badge: '🆓', // Badge displayed in UI
            purchases: [], // Array of purchases
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeUsers(users);
        
        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès',
            username: newUser.username
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get user profile
app.get('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const users = await readUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Get user's orders
        const orders = await readOrders();
        const userOrders = orders.filter(o => o.username === username);
        
        // Don't send password
        const { password, ...userProfile } = user;
        
        res.json({
            success: true,
            profile: {
                ...userProfile,
                totalOrders: userOrders.length,
                orders: userOrders
            }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get current pricing
app.get('/api/pricing', async (req, res) => {
    const standardPrice = calculateDynamicPrice(35);
    const instantPrice = calculateDynamicPrice(45);
    const premiumPrice = 60; // Prix fixe
    
    const today = new Date();
    const expiryDate = new Date('2026-11-05');
    const remainingTime = expiryDate - today;
    const remainingMonths = Math.ceil(remainingTime / (1000 * 60 * 60 * 24 * 30.44));
    
    // Calculer les places restantes pour la promo
    const orders = await readOrders();
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'pending');
    const launchPromoRemaining = Math.max(0, 10 - completedOrders.length);
    
    res.json({
        standardPrice,
        instantPrice,
        premiumPrice,
        remainingMonths,
        expiryDate: '2026-11-05',
        launchPromo: {
            active: launchPromoRemaining > 0,
            remaining: launchPromoRemaining,
            total: 10
        },
        plans: {
            standard: {
                price: standardPrice,
                features: ['1 appareil', 'Apps illimitées', '24-48h activation', 'Support email'],
                revocationRisk: true
            },
            instant: {
                price: instantPrice,
                features: ['1 appareil', 'Apps illimitées', 'Activation immédiate', 'Support prioritaire'],
                revocationRisk: true
            },
            premium: {
                price: premiumPrice,
                features: ['1 appareil', 'Toutes apps premium', 'Activation immédiate', 'Support VIP 24/7', 'Certificat Apple officiel', 'Garantie stabilité'],
                revocationRisk: false,
                guaranteed: true
            }
        }
    });
});

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        let { email, udid, deviceName, planType, username } = req.body;
        
        // Validation
        if (!email || !udid || !planType) {
            return res.status(400).json({ 
                error: 'Email, UDID et type de plan sont requis' 
            });
        }
        
        // 🎉 PROMO LAUNCH : Les 10 premières commandes sont upgradées en Premium
        const existingOrders = await readOrders();
        const completedOrders = existingOrders.filter(o => o.status === 'completed' || o.status === 'pending');
        let isLaunchPromo = false;
        
        if (completedOrders.length < 10 && planType !== 'premium') {
            planType = 'premium'; // Upgrade automatique
            isLaunchPromo = true;
            console.log(`🎉 PROMO LAUNCH: Commande #${completedOrders.length + 1} upgradée en Premium !`);
        }
        
        // Validate UDID format
        const udidRegex = /^[0-9a-fA-F-]{25,40}$/;
        if (!udidRegex.test(udid)) {
            return res.status(400).json({ 
                error: 'Format UDID invalide' 
            });
        }
        
        // Calculate price (client paie le prix original, mais reçoit Premium si promo)
        let finalPrice;
        let originalPlanType = req.body.planType; // Sauvegarder le plan original
        
        if (planType === 'premium' && !isLaunchPromo) {
            finalPrice = 60; // Prix fixe pour Premium (certificat officiel)
        } else {
            const basePrice = originalPlanType === 'instant' ? 45 : 35;
            finalPrice = calculateDynamicPrice(basePrice);
        }
        
        // Create order
        const order = {
            id: Date.now().toString(),
            email,
            udid,
            deviceName: deviceName || 'Non spécifié',
            planType, // Plan final (peut être 'premium' si promo)
            originalPlanType, // Plan que le client a commandé
            price: finalPrice,
            status: 'pending', // pending, processing, completed, failed
            createdAt: new Date().toISOString(),
            expiryDate: '2026-11-05',
            isPremium: planType === 'premium', // Flag pour certificat premium
            revocationProtection: planType === 'premium', // Protection révocation
            isLaunchPromo, // Flag pour savoir si c'est une commande promo
            username: username || null // Link to user account if logged in
        };
        
        // Save order
        const orders = await readOrders();
        orders.push(order);
        await writeOrders(orders);
        
        // Update user profile if logged in
        if (username) {
            try {
                const users = await readUsers();
                const userIndex = users.findIndex(u => u.username === username);
                
                if (userIndex !== -1) {
                    // Initialize purchases array if doesn't exist
                    if (!users[userIndex].purchases) {
                        users[userIndex].purchases = [];
                    }
                    
                    // Add purchase to user profile
                    users[userIndex].purchases.push({
                        orderId: order.id,
                        planType: order.planType,
                        price: order.price,
                        isPremium: order.isPremium,
                        isLaunchPromo: order.isLaunchPromo,
                        purchaseDate: order.createdAt
                    });
                    
                    // Update user status based on highest tier purchased
                    if (planType === 'premium') {
                        users[userIndex].status = 'premium';
                        users[userIndex].badge = '👑';
                    } else if (planType === 'instant' && users[userIndex].status !== 'premium') {
                        users[userIndex].status = 'instant';
                        users[userIndex].badge = '⚡';
                    } else if (!users[userIndex].status) {
                        users[userIndex].status = 'standard';
                        users[userIndex].badge = '✅';
                    }
                    
                    users[userIndex].lastPurchase = order.createdAt;
                    await writeUsers(users);
                    
                    console.log(`✅ Profil utilisateur ${username} mis à jour avec statut: ${users[userIndex].status}`);
                }
            } catch (error) {
                console.error('Erreur mise à jour profil utilisateur:', error);
                // Continue anyway, order was created successfully
            }
        }
        
        // TODO: Integrate payment gateway here (Stripe, PayPal, etc.)
        // For now, we'll simulate payment success
        
        res.status(201).json({
            success: true,
            orderId: order.id,
            message: isLaunchPromo ? 
                `🎉 Félicitations ! Votre commande a été UPGRADÉE EN PREMIUM gratuitement ! (Offre de lancement ${completedOrders.length + 1}/10)` : 
                'Commande créée avec succès',
            order: {
                id: order.id,
                price: order.price,
                planType: order.planType,
                originalPlanType: order.originalPlanType,
                status: order.status,
                isLaunchPromo: order.isLaunchPromo,
                isPremium: order.isPremium
            }
        });
        
        // Send email notifications
        sendOrderNotification(order).catch(err => {
            console.error('Erreur lors de l\'envoi de l\'email:', err);
            // Don't fail the order if email fails
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création de la commande' 
        });
    }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const orders = await readOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get orders by email
app.get('/api/orders/email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await readOrders();
        const userOrders = orders.filter(o => o.email === email);
        
        res.json(userOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Update order status (admin only - add authentication in production)
app.patch('/api/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const orders = await readOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        await writeOrders(orders);
        
        res.json({
            success: true,
            order: orders[orderIndex]
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get all orders (admin only - add authentication in production)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await readOrders();
        res.json({ orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get orders by username (for user profile)
app.get('/api/orders/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const orders = await readOrders();
        
        // Filter orders by username or email
        const userOrders = orders.filter(o => 
            o.username === username || 
            (o.email && o.email.includes(username))
        );
        
        // Sort by date (newest first)
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({ orders: userOrders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get specific order by ID (for customer dashboard)
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const orders = await readOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        res.json({ order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Update order status (admin only)
app.patch('/api/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }
        
        const orders = await readOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        // Update status
        const oldStatus = orders[orderIndex].status;
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        await writeOrders(orders);
        
        console.log(`✅ Commande ${orderId} mise à jour: ${status}`);
        
        // Send email to customer when order is completed
        if (status === 'completed' && oldStatus !== 'completed') {
            sendOrderCompletedEmail(orders[orderIndex]).catch(err => {
                console.error('Erreur envoi email completion:', err);
            });
        }
        
        res.json({
            success: true,
            message: 'Statut mis à jour',
            order: orders[orderIndex]
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Create certificate (admin only)
app.post('/api/certificates', async (req, res) => {
    try {
        const { orderId, certificateUrl, provisioningProfileUrl } = req.body;
        
        const certificate = {
            id: Date.now().toString(),
            orderId,
            certificateUrl,
            provisioningProfileUrl,
            createdAt: new Date().toISOString()
        };
        
        const certificates = await readCertificates();
        certificates.push(certificate);
        await writeCertificates(certificates);
        
        // Update order status
        const orders = await readOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'completed';
            orders[orderIndex].certificateId = certificate.id;
            await writeOrders(orders);
        }
        
        res.status(201).json({
            success: true,
            certificate
        });
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get certificate by order ID
app.get('/api/certificates/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const certificates = await readCertificates();
        const certificate = certificates.find(c => c.orderId === orderId);
        
        if (!certificate) {
            return res.status(404).json({ error: 'Certificat non trouvé' });
        }
        
        res.json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
});

// ==================== OTA INSTALLATION ENDPOINTS ====================

// Check if user UDID is authorized (has valid certificate)
app.get('/api/check-authorization', async (req, res) => {
    try {
        // TODO: In production, check user session and verify UDID is in certificate
        // For now, we'll check if user is logged in and has purchased a certificate
        
        const username = req.headers['x-username']; // Get from session/cookie
        
        if (!username) {
            return res.json({ authorized: false, reason: 'Not logged in' });
        }
        
        // Check if user has any completed orders
        const orders = await readOrders();
        const userOrders = orders.filter(o => 
            o.email && o.status === 'completed'
        );
        
        if (userOrders.length === 0) {
            return res.json({ 
                authorized: false, 
                reason: 'No valid certificate found' 
            });
        }
        
        res.json({ 
            authorized: true,
            certificateCount: userOrders.length,
            latestOrder: userOrders[userOrders.length - 1]
        });
        
    } catch (error) {
        console.error('Authorization check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Log app installation/download
app.post('/api/installations/log', async (req, res) => {
    try {
        const { appId, appName, action, timestamp, userAgent } = req.body;
        
        const installationsFile = path.join(__dirname, 'data', 'installations.json');
        
        // Read existing installations
        let installations = [];
        try {
            const data = await fs.readFile(installationsFile, 'utf-8');
            installations = JSON.parse(data);
        } catch {
            // File doesn't exist, start with empty array
        }
        
        // Add new installation log
        installations.push({
            id: Date.now().toString(),
            appId,
            appName,
            action, // 'install' or 'download'
            timestamp,
            userAgent,
            ip: req.ip || req.connection.remoteAddress
        });
        
        // Save installations log
        await fs.writeFile(installationsFile, JSON.stringify(installations, null, 2));
        
        res.json({ 
            success: true,
            message: 'Installation logged' 
        });
        
    } catch (error) {
        console.error('Error logging installation:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get installation statistics (admin only)
app.get('/api/admin/installations/stats', async (req, res) => {
    try {
        const installationsFile = path.join(__dirname, 'data', 'installations.json');
        
        let installations = [];
        try {
            const data = await fs.readFile(installationsFile, 'utf-8');
            installations = JSON.parse(data);
        } catch {
            return res.json({ stats: {}, total: 0 });
        }
        
        // Calculate statistics
        const stats = {};
        installations.forEach(install => {
            if (!stats[install.appId]) {
                stats[install.appId] = {
                    appName: install.appName,
                    installs: 0,
                    downloads: 0
                };
            }
            
            if (install.action === 'install') {
                stats[install.appId].installs++;
            } else if (install.action === 'download') {
                stats[install.appId].downloads++;
            }
        });
        
        res.json({
            stats,
            total: installations.length,
            lastActivity: installations[installations.length - 1]
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Refresh manifest files (admin function)
app.post('/api/admin/refresh-manifests', async (req, res) => {
    try {
        // TODO: Implement logic to regenerate manifest.plist files
        // This would update the URLs if the domain changes
        
        res.json({
            success: true,
            message: 'Manifests refreshed successfully'
        });
        
    } catch (error) {
        console.error('Error refreshing manifests:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve download files (certificate files)
app.get('/downloads/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const downloadPath = path.join(__dirname, 'downloads', filename);
        
        // Check if file exists
        try {
            await fs.access(downloadPath);
            res.download(downloadPath);
        } catch {
            res.status(404).json({ error: 'Fichier non trouvé' });
        }
    } catch (error) {
        console.error('Error serving download:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Serve frontend - redirect root to login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve other pages
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        const filePath = path.join(__dirname, req.path);
        res.sendFile(filePath, (err) => {
            if (err) {
                res.sendFile(path.join(__dirname, 'login.html'));
            }
        });
    }
});

// Initialize and start server
initializeDataFiles().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Serveur iOS Certifs démarré !                   ║
║                                                       ║
║   📍 URL: http://localhost:${PORT}                      ║
║   🔥 Backend API: http://localhost:${PORT}/api          ║
║                                                       ║
║   📊 Status: READY                                    ║
║   🕐 Time: ${new Date().toLocaleString('fr-FR')}  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
        `);
    });
});

module.exports = app;
