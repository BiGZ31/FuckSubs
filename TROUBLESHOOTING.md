# 🔧 Guide de dépannage - iOS Certifs

## Problèmes courants et solutions

### 1️⃣ Les animations ne s'affichent pas sur login.html

**Solutions :**

1. **Effacer le cache du navigateur** :
   - Chrome/Edge : Ctrl + Shift + Delete
   - Ou ouvrez la page en mode navigation privée

2. **Effacer localStorage** :
   - Ouvrir : `http://localhost:3000/logout.html`
   - Ou dans la console du navigateur : `localStorage.clear()`

3. **Tester avec la page de test** :
   - Ouvrir : `test-intro.html` directement
   - Si ça fonctionne ici, le problème vient de login.html

4. **Vérifier que intro.css est chargé** :
   - Ouvrir les DevTools (F12)
   - Onglet "Network"
   - Recharger la page
   - Vérifier que `intro.css` se charge (statut 200)

### 2️⃣ J'ai accès aux pages sans être connecté

**Pourquoi ?**
- Le script `auth.js` ne bloque pas si exécuté côté serveur
- La protection fonctionne uniquement côté client (navigateur)

**Solutions :**

1. **Vérifier que auth.js est chargé** :
   - Ouvrir F12 > Console
   - Taper : `localStorage.getItem('isLoggedIn')`
   - Si retourne `null`, vous n'êtes pas connecté

2. **Forcer la déconnexion** :
   ```
   Aller sur : http://localhost:3000/logout.html
   ```

3. **Recharger la page après déconnexion** :
   - Ctrl + F5 (rechargement forcé)

### 3️⃣ Le serveur ne démarre pas

**Commandes à essayer :**

```bash
# Option 1 : Double-cliquer sur install.bat
# Puis sur start-server.bat

# Option 2 : Dans PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "C:\Users\Luke\Desktop\AppleCertif"
npm install
npm start
```

### 4️⃣ Tester le système étape par étape

**Test 1 : Animations** (sans serveur)
1. Ouvrir directement : `test-intro.html`
2. Les animations doivent apparaître
3. Le bouton Debug en haut à droite montre l'état

**Test 2 : Login** (sans serveur)
1. Ouvrir : `logout.html` pour effacer la session
2. Ouvrir : `login.html`
3. L'intro doit s'afficher (8 secondes)
4. Cliquer sur "Accéder au site"
5. Se connecter avec n'importe quel identifiant

**Test 3 : Protection** (sans serveur)
1. Ouvrir : `index.html` directement
2. Doit rediriger vers `login.html`
3. Se connecter
4. Doit revenir sur `index.html`

**Test 4 : Avec serveur**
1. Démarrer le serveur : `npm start`
2. Aller sur : `http://localhost:3000`
3. Doit charger `login.html`
4. Se connecter (admin/admin123 ou n'importe quoi en mode démo)
5. Doit rediriger vers le site

### 5️⃣ Vérification manuelle

**Dans la console du navigateur (F12) :**

```javascript
// Vérifier l'état de connexion
console.log('Connecté ?', localStorage.getItem('isLoggedIn'));
console.log('Username :', localStorage.getItem('username'));

// Se déconnecter manuellement
localStorage.clear();
window.location.reload();

// Se connecter manuellement
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('username', 'test');
window.location.reload();
```

### 6️⃣ URLs importantes

| URL | Description |
|-----|-------------|
| `test-intro.html` | Tester les animations seules |
| `login.html` | Page de connexion avec intro |
| `logout.html` | Effacer la session + redirection |
| `http://localhost:3000` | Serveur (redirige vers login) |
| `http://localhost:3000/logout.html` | Déconnexion via serveur |

### 7️⃣ Structure des fichiers

```
AppleCertif/
├── login.html          ← Point d'entrée (intro + login)
├── intro.css           ← Styles des animations
├── intro.js            ← Logique d'authentification
├── auth.js             ← Protection des pages
├── test-intro.html     ← Page de test
├── logout.html         ← Page de déconnexion
├── index.html          ← Site principal (protégé)
├── apps.html           ← Applications (protégé)
└── dashboard.html      ← Dashboard (protégé)
```

### 8️⃣ Ordre de chargement correct

Dans chaque page protégée :
```html
<head>
    ...
    <script src="auth.js"></script>  ← AVANT la fermeture de head
</head>
<body>
    ...
    <script src="script.js"></script> ← À la fin du body
</body>
```

### 9️⃣ Déboggage avancé

**Si les animations ne se lancent pas :**

1. Ouvrir F12 > Console
2. Vérifier les erreurs JavaScript
3. Taper : `document.getElementById('introScreen')`
4. Doit retourner un élément HTML, pas `null`

**Si la redirection ne fonctionne pas :**

1. Ouvrir F12 > Application > Local Storage
2. Vérifier `isLoggedIn`
3. Supprimer manuellement si nécessaire

### 🎯 Solution rapide

**Pour tout réinitialiser :**

1. Fermer tous les onglets du site
2. Ouvrir : `logout.html`
3. Attendre 3 secondes
4. Vous serez redirigé vers `login.html`
5. L'intro devrait fonctionner

**Si ça ne fonctionne toujours pas :**

1. Ouvrir `test-intro.html`
2. Si les animations fonctionnent ici → problème dans `login.html`
3. Si elles ne fonctionnent pas → problème dans `intro.css`

### 📞 Checklist finale

- [ ] `intro.css` est bien dans le même dossier
- [ ] Cache du navigateur vidé (Ctrl + Shift + Delete)
- [ ] localStorage vidé (via logout.html)
- [ ] test-intro.html fonctionne
- [ ] DevTools ouvert pour voir les erreurs
- [ ] Page rechargée avec Ctrl + F5
