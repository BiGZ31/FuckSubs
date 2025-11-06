# 🧪 GUIDE DE TEST - Workflow de Commande Complète

## Objectif
Tester le workflow complet: Commande → Email → Admin complète → Email au client → Dashboard avec téléchargements

## Prérequis
- Serveur Node.js en cours d'exécution (`node server.js`)
- Configuration email dans `.env` (pour recevoir les notifications)
- Navigateur web moderne

---

## 📝 Étape 1: Créer une commande test

1. Ouvrez http://localhost:3000
2. Connectez-vous avec un compte (demo/demo123 ou créez-en un)
3. Allez sur la page d'achat
4. Remplissez le formulaire avec:
   - Email: **votre-email@exemple.com** (utilisez un vrai email pour tester)
   - UDID: `00001234-000123456789ABCD` (ou un vrai UDID)
   - Nom de l'appareil: "iPhone 14 Pro"
   - Plan: Standard, Instant ou Premium
5. Complétez le paiement
6. Notez l'**ID de la commande** affiché

### Résultat attendu:
- ✅ Message de confirmation affiché
- ✅ Redirection vers le dashboard
- ✅ Email envoyé à `fucksubs@proton.me` (admin)
- ✅ Email de confirmation envoyé au client

---

## 🔐 Étape 2: Accéder au panneau admin

1. Déconnectez-vous
2. Reconnectez-vous avec:
   - Username: **admin**
   - Password: **admin123**
3. Accédez à http://localhost:3000/admin.html
4. Vous devriez voir la liste des commandes

### Résultat attendu:
- ✅ Admin dashboard visible (les users normaux ne peuvent pas y accéder)
- ✅ Liste des commandes avec statut "pending" ou "processing"

---

## ⚙️ Étape 3: Marquer la commande comme complétée

1. Dans le panneau admin, trouvez votre commande test
2. Cliquez sur l'icône **✅ Compléter**
3. Confirmez l'action

### Résultat attendu:
- ✅ Statut de la commande change à "completed"
- ✅ Badge vert "✅ Complété" affiché
- ✅ Email automatique envoyé au client avec:
   - Sujet: "🎉 Votre certificat iOS est prêt!"
   - Contenu: Message de félicitations + lien vers le dashboard
   - Installation: Instructions en 3 étapes
   - Bouton "📱 Accéder au Dashboard"

---

## 📥 Étape 4: Vérifier le dashboard client

### Option A: Via le lien dans l'email
1. Ouvrez l'email reçu
2. Cliquez sur le bouton "📱 Accéder au Dashboard"

### Option B: Manuellement
1. Reconnectez-vous avec le compte client
2. Accédez à http://localhost:3000/dashboard.html
3. OU utilisez le lien direct: http://localhost:3000/dashboard.html?order={ORDER_ID}

### Résultat attendu:
- ✅ Message "🎉 Votre certificat est prêt !"
- ✅ Badge de statut: "✅ Certificat prêt" (vert)
- ✅ Section de téléchargement visible avec 3 cartes:
  - 📜 Certificat .p12
  - 📋 Profil .mobileprovision
  - 📖 Guide d'installation
- ✅ Boutons de téléchargement fonctionnels
- ✅ Guide d'installation affiché (7 étapes)
- ✅ Si Premium: Badge "👑 Certificat Premium" doré

---

## 🔄 Étape 5: Tester l'auto-refresh

1. Créez une nouvelle commande
2. Allez sur le dashboard pendant que la commande est "pending"
3. Depuis un autre onglet, marquez la commande comme "completed" dans l'admin
4. Attendez 30 secondes (auto-refresh automatique)

### Résultat attendu:
- ✅ Le dashboard se rafraîchit automatiquement
- ✅ La section de téléchargement apparaît sans recharger manuellement

---

## 📱 Test complet d'un flow utilisateur

### Scénario: Client achète un certificat Standard

```
1. [CLIENT] S'inscrit → Connexion
2. [CLIENT] Commande Standard (35€) → Paiement
3. [CLIENT] Voit "En attente" sur dashboard
4. [EMAIL] Reçoit confirmation de commande
5. [ADMIN] Voit nouvelle commande dans admin panel
6. [ADMIN] Enregistre l'UDID dans Apple Developer
7. [ADMIN] Génère les fichiers (certificat + profil)
8. [ADMIN] Place les fichiers dans /downloads/certificate-{orderId}.p12
9. [ADMIN] Marque la commande "✅ Compléter"
10. [EMAIL] Client reçoit "🎉 Certificat prêt!"
11. [CLIENT] Clique sur le lien dans l'email
12. [CLIENT] Voit dashboard avec téléchargements
13. [CLIENT] Télécharge certificat + profil + guide
14. [CLIENT] Installe sur son iPhone
15. [CLIENT] Profite des apps signées ! 🎉
```

---

## 🐛 Dépannage

### Problème: "Commande non trouvée"
- Vérifiez que l'ID de commande est correct
- Vérifiez que orders.json contient la commande
- Vérifiez que le serveur est bien démarré

### Problème: Email non reçu
- Vérifiez la configuration SMTP dans `.env`
- Vérifiez les logs du serveur (`console.log`)
- Vérifiez les spams/courrier indésirable
- Testez avec Mailtrap ou un service de test email

### Problème: Téléchargements ne fonctionnent pas
- Vérifiez que les fichiers existent dans `/downloads/`
- Vérifiez les permissions du dossier
- Vérifiez l'endpoint GET `/downloads/:filename`
- Regardez la console du navigateur (F12)

### Problème: Dashboard ne se met pas à jour
- Vérifiez que `dashboard.js` est bien chargé
- Vérifiez l'endpoint GET `/api/orders/:orderId`
- Vérifiez la console du navigateur pour les erreurs

---

## ✅ Checklist finale

Avant de déployer en production:

- [ ] Remplacer les fichiers de démo par de vrais certificats
- [ ] Configurer un vrai service SMTP (SendGrid, Mailgun, etc.)
- [ ] Changer le mot de passe admin par défaut
- [ ] Implémenter JWT au lieu de localStorage
- [ ] Protéger les endpoints admin côté serveur
- [ ] Migrer vers une vraie base de données (MongoDB, PostgreSQL)
- [ ] Utiliser un stockage cloud sécurisé (S3, Azure Blob)
- [ ] Ajouter génération automatique de certificats via Apple Developer API
- [ ] Ajouter système de paiement réel (Stripe, PayPal)
- [ ] Configurer HTTPS avec certificat SSL
- [ ] Tester sur de vrais iPhones avec de vrais UDID
- [ ] Ajouter rate limiting et sécurité anti-fraude

---

## 📊 Statuts de commande

| Statut | Badge | Signification | Actions disponibles |
|--------|-------|---------------|---------------------|
| `pending` | 🕐 En attente | Commande reçue | Admin: Passer en "processing" |
| `processing` | ⚡ En cours | UDID en cours d'enregistrement | Admin: Compléter ou annuler |
| `completed` | ✅ Complété | Certificat prêt | Client: Télécharger fichiers |
| `cancelled` | ❌ Annulé | Commande annulée | Aucune |

---

## 🎯 Objectif atteint !

Vous avez maintenant un système complet de gestion de commandes avec:
- ✅ Workflow de commande automatisé
- ✅ Notifications email automatiques
- ✅ Dashboard admin avec gestion des statuts
- ✅ Dashboard client avec téléchargements conditionnels
- ✅ Auto-refresh pour mise à jour en temps réel
- ✅ Sécurité admin avec rôles
- ✅ Support de 3 plans (Standard, Instant, Premium)

Bon test ! 🚀
