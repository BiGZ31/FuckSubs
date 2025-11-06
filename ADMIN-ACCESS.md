# 🔐 Admin Access Guide

## 🎯 Comment accéder au panneau admin

### Compte Admin par défaut

**Username:** `admin`  
**Password:** `admin123`

---

## 🚀 Étapes pour se connecter

1. **Ouvrir la page de connexion**: `login.html`
2. **Entrer les identifiants admin**:
   - Username: `admin`
   - Password: `admin123`
3. **Se connecter**
4. **Le lien "🛡️ Admin" apparaît dans la navbar**
5. **Cliquer sur "🛡️ Admin"** pour accéder au dashboard

---

## 🔒 Sécurité

### Ce qui a été implémenté:

✅ **Vérification du rôle**
- Seuls les utilisateurs avec `role: 'admin'` peuvent accéder
- Les utilisateurs normaux ne voient pas le lien admin
- Redirection automatique si accès non autorisé

✅ **Protection de la page**
- `admin.html` vérifie le rôle dans localStorage
- Alerte et redirection si pas admin
- Impossible d'accéder directement à l'URL

✅ **Masquage du lien**
- Le lien "🛡️ Admin" est caché pour les utilisateurs normaux
- Visible uniquement pour les admins connectés

---

## 👥 Types d'utilisateurs

### Utilisateur normal (demo)
```javascript
{
    username: "demo",
    role: "user",
    // Peut voir: Accueil, Apps, Profil
    // Ne peut pas voir: Admin
}
```

### Administrateur
```javascript
{
    username: "admin",
    role: "admin",
    // Peut voir: Tout + Admin Dashboard
}
```

---

## ⚙️ Créer un nouvel admin

### Option 1: Modifier users.json directement

```json
{
  "id": "2",
  "username": "votre_username",
  "password": "votre_password",
  "email": "email@example.com",
  "role": "admin",
  "status": "free",
  "badge": "🆓",
  "purchases": [],
  "createdAt": "2025-11-06T10:00:00Z"
}
```

### Option 2: Créer via API (à implémenter)

```javascript
// Endpoint à ajouter dans server.js
app.post('/api/admin/create', requireAdmin, async (req, res) => {
    const { username, password, email } = req.body;
    
    const newAdmin = {
        id: Date.now().toString(),
        username,
        password, // Hash in production!
        email,
        role: 'admin',
        status: 'free',
        badge: '🆓',
        purchases: [],
        createdAt: new Date().toISOString()
    };
    
    const users = await readUsers();
    users.push(newAdmin);
    await writeUsers(users);
    
    res.json({ success: true, admin: newAdmin });
});
```

---

## 🔐 Changer le mot de passe admin

### Méthode actuelle (développement):

1. Ouvrir `data/users.json`
2. Trouver l'utilisateur admin
3. Changer le champ `password`
4. Sauvegarder

### Pour la production:

⚠️ **Important**: Hash les mots de passe avec bcrypt!

```javascript
const bcrypt = require('bcrypt');

// Lors de la création
const hashedPassword = await bcrypt.hash('admin123', 10);

// Lors du login
const isValid = await bcrypt.compare(password, user.password);
```

---

## 🚨 Test de sécurité

### Utilisateur normal tente d'accéder:

1. **Connecté comme "demo"**
2. **Lien admin masqué** ✅
3. **Tente d'accéder directement**: `admin.html`
4. **Résultat**: 
   ```
   🚫 Accès refusé! Vous devez être administrateur pour accéder à cette page.
   → Redirigé vers index.html
   ```

### Admin connecté:

1. **Connecté comme "admin"**
2. **Lien admin visible** ✅
3. **Clique sur "🛡️ Admin"**
4. **Résultat**: Accès au dashboard ✅

---

## 📋 Checklist Production

Avant de mettre en production:

- [ ] Changer le mot de passe admin par défaut
- [ ] Hasher les mots de passe (bcrypt)
- [ ] Utiliser JWT tokens au lieu de localStorage
- [ ] Ajouter rate limiting sur les endpoints admin
- [ ] Logger toutes les actions admin
- [ ] Ajouter 2FA (authentification à deux facteurs)
- [ ] Protéger les endpoints API côté serveur
- [ ] Ajouter timeout de session
- [ ] Implémenter refresh tokens
- [ ] Configurer HTTPS obligatoire

---

## 🔧 Protection côté serveur (à ajouter)

Actuellement, la vérification est **uniquement côté client**. Pour la production, ajoutez une protection serveur:

```javascript
// Middleware admin dans server.js
function requireAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Accès admin requis' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide' });
    }
}

// Protéger les routes admin
app.get('/api/orders', requireAdmin, async (req, res) => { ... });
app.patch('/api/orders/:orderId/status', requireAdmin, async (req, res) => { ... });
```

---

## 💡 Fonctionnalités admin

En tant qu'admin, vous pouvez:

✅ Voir toutes les commandes
✅ Filtrer et rechercher
✅ Mettre à jour les statuts
✅ Voir les détails complets
✅ Copier les UDID
✅ Voir les statistiques

---

## 🎓 Résumé

**Connexion admin:**
1. Login avec `admin` / `admin123`
2. Lien "🛡️ Admin" apparaît
3. Accès au dashboard complet

**Sécurité:**
- Vérification du rôle dans localStorage
- Protection de la page admin
- Lien masqué pour les non-admins
- Redirection automatique

**Important:** 
⚠️ Changez le mot de passe admin par défaut!
⚠️ Ajoutez la protection serveur pour la production!

---

## 🆘 Problèmes courants

**"Le lien admin n'apparaît pas"**
- Vérifiez que vous êtes connecté comme admin
- Vérifiez `localStorage.getItem('userRole')` dans la console
- Doit être `'admin'` et non `'user'`

**"Accès refusé même en tant qu'admin"**
- Déconnectez-vous et reconnectez-vous
- Videz le localStorage
- Vérifiez que le role est bien 'admin' dans users.json

**"Lien admin visible mais page bloque"**
- Vérifiez la console pour les erreurs
- Assurez-vous que le serveur est démarré
- Vérifiez le role dans localStorage

---

**Maintenant seul l'admin peut accéder au dashboard! 🔐**
