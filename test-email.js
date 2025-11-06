// Test Email Configuration
// Usage: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Test de configuration email...\n');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com', // Change selon ton provider
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    console.log('📧 Configuration:');
    console.log('   Email:', process.env.EMAIL_USER);
    console.log('   Host: smtp-mail.outlook.com');
    console.log('   Port: 587\n');

    try {
        console.log('📤 Envoi d\'un email de test...');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'fucksubs@proton.me', // Change pour ton email de test
            subject: '✅ Test Email - Configuration Réussie',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            background: #f5f5f5;
                            padding: 20px;
                            margin: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 12px;
                            padding: 40px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #30D158;
                            margin: 0 0 10px;
                        }
                        .info {
                            background: #f8f9fa;
                            border-left: 4px solid #007AFF;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .success {
                            background: linear-gradient(135deg, #30D158, #32D974);
                            color: white;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                            margin-top: 30px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Configuration Email Réussie !</h1>
                            <p>Votre serveur peut maintenant envoyer des emails.</p>
                        </div>
                        
                        <div class="info">
                            <strong>📧 Informations de test:</strong><br>
                            Expéditeur: ${process.env.EMAIL_USER}<br>
                            Date: ${new Date().toLocaleString('fr-FR')}<br>
                            Serveur: iOS Certifs Backend
                        </div>
                        
                        <p>
                            Ce message confirme que votre configuration SMTP est correcte et que le système 
                            peut envoyer des notifications email aux clients et administrateurs.
                        </p>
                        
                        <div class="success">
                            <strong>🎉 Tout fonctionne parfaitement !</strong><br>
                            Vous pouvez maintenant lancer votre serveur en production.
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        
        console.log('\n✅ Email envoyé avec succès !');
        console.log('   Message ID:', info.messageId);
        console.log('   Destinataire: fucksubs@proton.me');
        console.log('\n🎉 Configuration email validée !\n');
        
    } catch (error) {
        console.error('\n❌ Erreur lors de l\'envoi:\n');
        console.error('   Message:', error.message);
        
        if (error.code === 'EAUTH') {
            console.error('\n💡 Solution:');
            console.error('   1. Vérifiez EMAIL_USER et EMAIL_PASS dans .env');
            console.error('   2. Pour Gmail: créez un mot de passe d\'application');
            console.error('   3. Pour Outlook: désactivez temporairement la 2FA');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
            console.error('\n💡 Solution:');
            console.error('   1. Vérifiez votre connexion internet');
            console.error('   2. Vérifiez que le port 587 n\'est pas bloqué');
            console.error('   3. Essayez un autre fournisseur SMTP');
        }
        
        console.error('\n📖 Voir EMAIL-SETUP.md pour plus d\'aide\n');
        process.exit(1);
    }
}

// Lancer le test
testEmail();
