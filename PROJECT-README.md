# 🍎 iOS Certificate Management System

Système complet de vente et gestion de certificats iOS avec installation OTA (Over-The-Air).

## ✨ Fonctionnalités

### Pour les Clients
- 🛒 Achat de certificats iOS (Standard, Instant, Premium)
- 📱 Dashboard personnalisé avec suivi de commande en temps réel
- 📥 Téléchargement automatique des fichiers certificats
- 📧 Notifications email à chaque étape
- ⚡ Auto-refresh du statut (toutes les 30 secondes)
- 🎉 Offre de lancement: 10 premières commandes → Premium gratuit!

### Pour les Administrateurs
- 📊 Dashboard admin avec gestion complète des commandes
- 🔍 Recherche et filtres avancés
- ✅ Mise à jour de statut (pending → processing → completed)
- 📧 Emails automatiques lors de la completion
- 👥 Gestion des utilisateurs et rôles
- 📈 Vue d'ensemble des commandes

### Technique
- 🔐 Système d'authentification avec rôles (user/admin)
- 📡 API REST complète
- 💾 Base de données JSON (prête pour migration SQL)
- 📮 Notifications email avec Nodemailer
- 🎨 Interface dark theme moderne
- 📱 Design responsive (mobile-first)

---

## 🚀 Installation Rapide

### 1. Prérequis
- Node.js 14+ installé
- npm ou yarn
- Un compte email (Outlook, Gmail, etc.)

### 2. Installation
```bash
# Cloner le projet
cd AppleCertif

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

### 3. Configuration Email
Éditez `.env`:
```env
EMAIL_USER=votre-email@outlook.com
EMAIL_PASS=votre-mot-de-passe
PORT=3000
```

Voir **[EMAIL-SETUP.md](EMAIL-SETUP.md)** pour configuration détaillée.

### 4. Lancer le serveur
```bash
node server.js
```

Accédez à: **http://localhost:3000**

---

## 📁 Structure du Projet

```
AppleCertif/
├── 📄 server.js              # Backend Node.js + API REST
├── 🎨 Frontend
│   ├── index.html            # Page d'accueil
│   ├── login.html            # Connexion
│   ├── dashboard.html        # Dashboard client
│   ├── admin.html            # Dashboard admin
│   ├── styles.css            # Styles globaux
│   ├── dashboard.css         # Styles dashboard
│   ├── script.js             # Logique homepage
│   ├── dashboard.js          # Logique dashboard dynamique
│   └── auth.js               # Authentification
├── 💾 Data (JSON)
│   ├── orders.json           # Commandes
│   ├── users.json            # Utilisateurs
│   └── certificates.json     # Certificats
├── 📥 downloads/             # Fichiers clients
│   ├── certificate-{id}.p12
│   ├── profile-{id}.mobileprovision
│   └── guide-installation.pdf
├── 📚 Documentation
│   ├── README.md             # Ce fichier
│   ├── TEST-WORKFLOW.md      # Guide de test complet
│   ├── IMPLEMENTATION-SUMMARY.md  # Récap technique
│   ├── EMAIL-SETUP.md        # Config email
│   └── ADMIN-ACCESS.md       # Accès admin
└── 📦 package.json           # Dépendances
```

---

## 🎯 Utilisation

### Compte Client
1. Créez un compte ou utilisez: **demo / demo123**
2. Parcourez les certificats disponibles
3. Passez une commande (fournissez UDID + email)
4. Recevez email de confirmation
5. Attendez la completion (24-48h ou instantané)
6. Recevez email avec lien de téléchargement
7. Téléchargez vos fichiers depuis le dashboard

### Compte Admin
1. Connectez-vous avec: **admin / admin123**
2. Accédez au dashboard admin via le menu
3. Visualisez toutes les commandes
4. Marquez une commande "En cours" puis "Complétée"
5. Le client reçoit automatiquement un email
6. Les fichiers deviennent téléchargeables

---

## 📧 Système d'Email

### Email 1: Confirmation de Commande
- **Destinataires**: Admin (fucksubs@proton.me) + Client
- **Déclencheur**: Nouvelle commande créée
- **Contenu**:
  - Numéro de commande
  - Plan acheté (Standard/Instant/Premium)
  - UDID de l'appareil
  - Statut: "En attente"
  - Prix payé

### Email 2: Certificat Prêt
- **Destinataire**: Client uniquement
- **Déclencheur**: Admin marque la commande "Completed"
- **Contenu**:
  - 🎉 Message de félicitations
  - Bouton "Accéder au Dashboard"
  - Infos de commande
  - Guide d'installation (3 étapes)
  - Badge promo de lancement si applicable
  - Avertissement sécurité

---

## 🔒 Sécurité

### Actuel (Développement)
- ✅ Authentification localStorage
- ✅ Rôles utilisateur (user/admin)
- ✅ Validation côté client
- ✅ Protection page admin

### Production (À implémenter)
- [ ] JWT tokens avec expiration
- [ ] Authentification Bearer sur API
- [ ] Rate limiting (express-rate-limit)
- [ ] HTTPS obligatoire
- [ ] CORS restrictif
- [ ] Hashing des mots de passe (bcrypt)
- [ ] 2FA pour admin
- [ ] Stockage cloud sécurisé (S3, Azure)
- [ ] URLs de téléchargement signées
- [ ] Logs d'audit complets

---

## 🛠️ API Endpoints

### Authentification
```
POST   /api/auth/login         # Connexion
POST   /api/auth/register      # Inscription
```

### Commandes
```
GET    /api/pricing            # Prix dynamiques
POST   /api/orders             # Créer commande
GET    /api/orders             # Liste (admin)
GET    /api/orders/:id         # Détails commande
PATCH  /api/orders/:id/status  # Mettre à jour statut (admin)
```

### Certificats
```
POST   /api/certificates       # Créer certificat (admin)
GET    /api/certificates/order/:orderId  # Par commande
```

### Téléchargements
```
GET    /downloads/:filename    # Télécharger fichier
```

### Utilisateurs
```
GET    /api/users/:username    # Profil utilisateur
PUT    /api/users/:username    # Mettre à jour
```

---

## 🎨 Plans Tarifaires

### 📦 Standard (35€ → 10€)
- ✅ 1 appareil
- ✅ Apps illimitées
- ⏱️ Activation 24-48h
- 📧 Support email
- ⚠️ Risque de révocation

### ⚡ Instant (45€)
- ✅ 1 appareil
- ✅ Apps illimitées
- ⚡ Activation immédiate
- 🎯 Support prioritaire
- ⚠️ Risque de révocation

### 👑 Premium (60€ fixe)
- ✅ 1 appareil
- ✅ Toutes apps premium
- ⚡ Activation immédiate
- 👑 Support VIP 24/7
- ✅ Certificat Apple officiel
- ✅ **SANS risque de révocation**
- 🛡️ Garantie stabilité 1 an

### 🎉 Offre de Lancement
Les **10 premières commandes** sont automatiquement upgradées en **Premium** gratuitement!

---

## 📊 Statuts de Commande

| Statut | Badge | Description | Actions |
|--------|-------|-------------|---------|
| `pending` | 🕐 En attente | Commande reçue, en attente de traitement | Admin: Passer en "processing" |
| `processing` | ⚡ En cours | UDID en cours d'enregistrement | Admin: Compléter ou annuler |
| `completed` | ✅ Complété | Certificat prêt, fichiers disponibles | Client: Télécharger |
| `cancelled` | ❌ Annulé | Commande annulée | Aucune |

---

## 🧪 Tests

Suivez le guide: **[TEST-WORKFLOW.md](TEST-WORKFLOW.md)**

```bash
# Test rapide
1. Lancer serveur: node server.js
2. Ouvrir: http://localhost:3000
3. Se connecter: demo / demo123
4. Créer une commande test
5. Se connecter admin: admin / admin123
6. Marquer commande "Completed"
7. Vérifier email + dashboard client
```

---

## 🔧 Configuration Avancée

### Base de Données
Par défaut, utilise des fichiers JSON dans `/data/`. Pour migrer vers PostgreSQL/MongoDB:

1. Installer pg ou mongoose
2. Remplacer `readOrders()` / `writeOrders()` par requêtes SQL
3. Créer schémas de tables
4. Migrer les données existantes

### Email
Voir **[EMAIL-SETUP.md](EMAIL-SETUP.md)** pour:
- Configuration Outlook/Gmail/ProtonMail
- Services professionnels (SendGrid, Mailgun, SES)
- Dépannage erreurs SMTP
- Limites d'envoi

### Paiement
Pour intégrer Stripe:
```bash
npm install stripe
```

Voir documentation Stripe pour checkout sessions.

### Certificats
Pour génération automatique via Apple Developer API:
- Configurer App Store Connect API Key
- Utiliser `fastlane` ou `app-store-connect-cli`
- Automatiser création de provisioning profiles

---

## 📈 Roadmap

### ✅ Phase 1: MVP (Complété)
- [x] Interface dark theme
- [x] Système d'authentification
- [x] Backend API
- [x] Dashboard client
- [x] Dashboard admin
- [x] Notifications email
- [x] Téléchargements

### 🔄 Phase 2: Production (En cours)
- [ ] Base de données SQL
- [ ] JWT authentification
- [ ] Paiement Stripe
- [ ] Email service pro
- [ ] HTTPS + domaine
- [ ] Tests automatisés

### 🎯 Phase 3: Scale
- [ ] Génération auto certificats
- [ ] API publique
- [ ] App mobile admin
- [ ] Analytics avancés
- [ ] Multi-langue
- [ ] Support chat live

---

## 🐛 Problèmes Connus

### Email non reçu
→ Vérifier configuration `.env` et spam
→ Voir [EMAIL-SETUP.md](EMAIL-SETUP.md)

### Dashboard ne se met pas à jour
→ Vérifier que `dashboard.js` est bien chargé
→ Ouvrir console (F12) pour voir les erreurs

### "Commande non trouvée"
→ Vérifier que `orders.json` contient la commande
→ Utiliser l'ID exact (sensible à la casse)

### Admin page not accessible
→ Se connecter avec: admin / admin123
→ Vérifier localStorage: `userRole` doit être "admin"

---

## 📞 Support

- **Email**: fucksubs@proton.me
- **Documentation**: Voir fichiers `.md` dans le projet
- **Logs**: Console Node.js + DevTools (F12)

---

## 📄 Licence

Projet privé - Tous droits réservés.

---

## 🙏 Crédits

Développé avec ❤️ pour la communauté iOS.

**Stack**:
- Node.js + Express
- Vanilla JavaScript
- Nodemailer
- HTML5 + CSS3

---

## 🎉 Quick Start

```bash
# Installation 1 minute
npm install
cp .env.example .env
# Éditer .env avec votre email

# Lancer
node server.js

# Accéder
http://localhost:3000

# Login admin
admin / admin123

# Login demo
demo / demo123
```

**C'est parti ! 🚀**

---

*Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}*
*Version: 1.0.0*
