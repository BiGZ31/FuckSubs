# iOS Certifs - Backend

Backend Node.js pour le site de certificats iOS.

## 🚀 Installation

### 1. Installer Node.js
Si vous n'avez pas Node.js installé, téléchargez-le depuis [nodejs.org](https://nodejs.org/)

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration
Éditez le fichier `.env` avec vos paramètres :
- Configuration email (pour l'envoi d'emails de confirmation)
- Clés API de paiement (Stripe, PayPal, etc.)
- Autres paramètres selon vos besoins

## 📦 Démarrage

### Mode Production
```bash
npm start
```

### Mode Développement (avec auto-reload)
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### Public Endpoints

#### GET /api/pricing
Récupère les prix actuels (calculés dynamiquement)
```json
{
  "standardPrice": 35,
  "instantPrice": 45,
  "remainingMonths": 12,
  "expiryDate": "2026-11-05"
}
```

#### POST /api/orders
Créer une nouvelle commande
```json
{
  "email": "client@example.com",
  "udid": "00008030-001234567890123A",
  "deviceName": "iPhone de Jean",
  "planType": "standard"
}
```

#### GET /api/orders/:orderId
Récupérer une commande par ID

#### GET /api/orders/email/:email
Récupérer toutes les commandes d'un email

#### GET /api/certificates/order/:orderId
Récupérer le certificat d'une commande

### Admin Endpoints (à sécuriser en production)

#### GET /api/admin/orders
Liste toutes les commandes

#### PATCH /api/orders/:orderId/status
Mettre à jour le statut d'une commande
```json
{
  "status": "completed"
}
```

#### POST /api/certificates
Créer un certificat pour une commande
```json
{
  "orderId": "1234567890",
  "certificateUrl": "https://example.com/cert.p12",
  "provisioningProfileUrl": "https://example.com/profile.mobileprovision"
}
```

## 📁 Structure des données

Les données sont stockées dans le dossier `data/` :
- `orders.json` - Toutes les commandes
- `certificates.json` - Tous les certificats générés

### Exemple de commande
```json
{
  "id": "1699200000000",
  "email": "client@example.com",
  "udid": "00008030-001234567890123A",
  "deviceName": "iPhone de Jean",
  "planType": "standard",
  "price": 35,
  "status": "pending",
  "createdAt": "2025-11-05T12:00:00.000Z",
  "expiryDate": "2026-11-05"
}
```

## 🔐 Sécurité (TODO pour production)

- [ ] Ajouter l'authentification pour les endpoints admin
- [ ] Implémenter JWT pour les sessions
- [ ] Sécuriser les routes sensibles
- [ ] Ajouter rate limiting
- [ ] Valider toutes les entrées utilisateur
- [ ] Chiffrer les données sensibles
- [ ] Configurer HTTPS

## 💳 Intégration Paiement

Le backend est prêt pour intégrer un système de paiement :
- Stripe (recommandé)
- PayPal
- Autres passerelles

Décommentez et configurez la section paiement dans `server.js`

## 📧 Configuration Email

Pour envoyer des emails de confirmation, configurez Nodemailer dans `.env` :
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app
```

## 🗄️ Migration vers une vraie base de données

Pour la production, remplacez les fichiers JSON par :
- MongoDB (recommandé pour la flexibilité)
- PostgreSQL (pour les données relationnelles)
- MySQL

## 📊 Monitoring

- Logs des erreurs dans la console
- Ajoutez un service de monitoring (Sentry, LogRocket, etc.)

## 🚢 Déploiement

Le backend peut être déployé sur :
- Heroku
- Railway
- Render
- DigitalOcean
- AWS
- Vercel (pour les fonctions serverless)

## 📝 Notes

- Le système de tarification dynamique calcule automatiquement les prix
- Les prix diminuent proportionnellement au temps restant jusqu'au 5 novembre 2026
- Prix minimum : 10€
