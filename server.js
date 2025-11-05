const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

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
        let { email, udid, deviceName, planType } = req.body;
        
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
            isLaunchPromo // Flag pour savoir si c'est une commande promo
        };
        
        // Save order
        const orders = await readOrders();
        orders.push(order);
        await writeOrders(orders);
        
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
        
        // TODO: Send confirmation email
        console.log(`📧 Email à envoyer à: ${email}`);
        
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
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await readOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
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
