# Système d'Authentification - iOS Certifs

## 🔐 Fonctionnalités

Le site est maintenant **privé** avec un système d'authentification complet :

### 1. **Page d'introduction animée**
- Message percutant sur le coût des abonnements
- Calcul du coût total : 419,64€/an pour tous les abonnements
- Mise en avant de l'économie : Tout pour 35€ !
- Animations fluides et professionnelles

### 2. **Système de connexion**
- Identifiant et mot de passe requis
- Protection de toutes les pages
- Session persistante (localStorage)
- Affichage du nom d'utilisateur dans la navbar
- Bouton de déconnexion

## 🚀 Utilisation

### Pour accéder au site :

1. **Ouvrez** `login.html` (ou `home.html` qui redirige automatiquement)
2. **Regardez l'intro** qui explique les avantages
3. **Connectez-vous** avec un identifiant

### Mode Démo (sans backend)
Utilisez **n'importe quel** identifiant et mot de passe pour vous connecter.

### Avec Backend
Comptes par défaut :
- **Admin** : `admin` / `admin123`
- **Demo** : `demo` / `demo123`

## 📁 Fichiers créés

### Frontend
- `login.html` - Page d'intro et de connexion
- `intro.css` - Styles pour l'intro et le login
- `intro.js` - Logique d'authentification
- `auth.js` - Protection des pages et gestion de session
- `home.html` - Point d'entrée qui redirige vers login

### Backend (API)
Routes ajoutées dans `server.js` :
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (si activée)

Fichier de données :
- `data/users.json` - Base de données utilisateurs

## 🔒 Sécurité

### Actuellement (Démo)
- ✅ Protection basique avec localStorage
- ✅ Redirection automatique si non connecté
- ✅ Mots de passe en clair dans users.json

### Pour la Production (TODO)
- [ ] Hasher les mots de passe (bcrypt)
- [ ] Implémenter JWT (JSON Web Tokens)
- [ ] Ajouter HTTPS obligatoire
- [ ] Rate limiting sur les tentatives de connexion
- [ ] Session timeout automatique
- [ ] Protection CSRF
- [ ] Validation côté serveur renforcée

## 💡 Personnalisation

### Changer les comptes par défaut

Éditez `data/users.json` :
```json
[
  {
    "id": "1",
    "username": "votre_username",
    "password": "votre_password",
    "role": "admin",
    "createdAt": "2025-11-05T12:00:00.000Z"
  }
]
```

### Désactiver le mode démo

Dans `intro.js`, commentez la section "demo mode" et gardez uniquement l'appel API.

### Personnaliser l'intro

Éditez `login.html` :
- Modifiez les prix des abonnements
- Changez les textes
- Ajustez les animations dans `intro.css`

## 🎨 Thème

L'intro et le login utilisent le **thème sombre** défini dans `styles.css` :
- Fond noir/gris foncé
- Accents bleus (#0A84FF)
- Rouge pour les alertes (#FF453A)
- Vert pour les succès (#30D158)

## 📱 Responsive

Toutes les pages sont **100% responsive** :
- Desktop
- Tablette
- Mobile

## 🔄 Flux utilisateur

```
1. Utilisateur arrive sur le site
   ↓
2. Redirection vers login.html
   ↓
3. Affichage de l'intro animée (8 secondes)
   ↓
4. Bouton "Accéder au site" → Formulaire de connexion
   ↓
5. Saisie identifiant/mot de passe
   ↓
6. Vérification (backend ou mode démo)
   ↓
7. Session enregistrée dans localStorage
   ↓
8. Redirection vers index.html
   ↓
9. Navigation libre sur toutes les pages
   ↓
10. Bouton "Déconnexion" disponible dans navbar
```

## 🛠️ Configuration Backend

Pour activer l'authentification backend :

1. Démarrez le serveur :
```bash
npm start
```

2. Les routes API seront disponibles :
- `POST /api/auth/login`
- `POST /api/auth/register`

3. Le fichier `data/users.json` sera créé automatiquement

## 📝 Notes

- La session persiste jusqu'à déconnexion manuelle
- Pas de timeout automatique (à implémenter en production)
- Le mode démo fonctionne même sans backend
- Toutes les pages sont protégées automatiquement

## 🚨 Important

Pour un site en production :
1. **Ne stockez JAMAIS les mots de passe en clair**
2. Utilisez HTTPS
3. Implémentez un vrai système de tokens (JWT)
4. Ajoutez une vraie base de données
5. Activez les logs de sécurité
