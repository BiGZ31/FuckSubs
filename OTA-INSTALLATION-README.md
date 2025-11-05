# 📲 Système OTA (Over-The-Air) Installation

## Vue d'ensemble

Ce système permet l'installation automatique d'applications iOS signées directement depuis le navigateur, sans besoin de câble ou d'ordinateur.

## 🏗️ Architecture

```
┌─────────────────┐
│   Utilisateur   │
│    (iPhone)     │
└────────┬────────┘
         │
         │ 1. Clique "Installer"
         ▼
┌─────────────────┐
│   apps.html     │──▶ Vérifie autorisation UDID
│  (Frontend)     │
└────────┬────────┘
         │
         │ 2. itms-services://
         ▼
┌─────────────────┐
│   iOS System    │──▶ Lit manifest.plist
└────────┬────────┘
         │
         │ 3. Télécharge IPA
         ▼
┌─────────────────┐
│  Votre serveur  │──▶ /ipas/app.ipa
│   (Backend)     │
└─────────────────┘
```

## 📁 Structure des fichiers

```
AppleCertif/
├── manifests/               # Fichiers manifest.plist pour iOS
│   ├── spotify.plist
│   ├── youtube.plist
│   ├── deezer.plist
│   └── ...
├── ipas/                   # Applications signées (.ipa)
│   ├── spotify.ipa        (À ajouter - signez vos apps ici)
│   ├── youtube.ipa
│   └── ...
├── icons/                  # Icônes d'applications
├── ota-install.js         # Logique d'installation OTA
├── ota-install.css        # Styles pour l'interface
└── apps.html              # Page d'installation
```

## 🔧 Configuration

### 1. Modifier les manifest.plist

Dans chaque fichier `manifests/*.plist`, remplacez `https://votre-domaine.com` par votre URL réelle :

```xml
<key>url</key>
<string>https://VOTRE-DOMAINE.com/ipas/spotify.ipa</string>
```

### 2. Signer vos applications

Pour chaque application :

```bash
# Utiliser zsign ou similaire
zsign -k certificate.p12 -m provisioning.mobileprovision -o signed.ipa original.ipa

# Placer dans le dossier ipas/
mv signed.ipa ipas/spotify.ipa
```

### 3. Configurer HTTPS

⚠️ **IMPORTANT** : iOS exige HTTPS pour l'installation OTA.

- Achetez un certificat SSL
- Ou utilisez Let's Encrypt (gratuit)
- Configurez votre serveur web (nginx/Apache)

### 4. Configurer le serveur

Le serveur Node.js est déjà configuré pour :
- ✅ Servir les fichiers statiques
- ✅ Servir les manifests.plist
- ✅ Servir les fichiers .ipa
- ✅ Logger les installations

## 🚀 Utilisation

### Pour l'utilisateur :

1. Acheter un certificat sur le site
2. Se connecter avec ses identifiants
3. Aller sur la page "Apps disponibles"
4. Cliquer sur "📲 Installer" (sur iPhone uniquement)
5. iOS ouvre l'installateur automatiquement
6. Confirmer l'installation dans Réglages > Général > VPN & Gestion des appareils

### Pour l'admin :

1. **Ajouter un nouvel UDID :**
   ```bash
   # 1. Ajouter l'UDID au profil de provisionnement Apple Developer
   # 2. Re-signer TOUTES les apps avec le nouveau certificat
   # 3. Uploader les nouveaux IPAs dans /ipas/
   ```

2. **Ajouter une nouvelle app :**
   ```bash
   # 1. Créer manifests/nouvelle-app.plist
   # 2. Signer l'app et placer dans ipas/nouvelle-app.ipa
   # 3. Ajouter une carte dans apps.html avec les boutons d'installation
   ```

3. **Voir les statistiques :**
   ```
   GET http://localhost:3000/api/admin/installations/stats
   ```

## 📱 Apps disponibles

| App | ID | Version | Status |
|-----|-----|---------|--------|
| Spotify++ | `spotify` | 8.8.96 | ✅ Configuré |
| YouTube++ | `youtube` | 19.45.2 | ✅ Configuré |
| Deezer++ | `deezer` | 9.7.0 | ✅ Configuré |
| TikTok++ | `tiktok` | 34.0.0 | ✅ Configuré |
| YouTube Music++ | `youtubemusic` | 7.02.2 | ✅ Configuré |
| Instagram++ | `instagram` | 309.0 | ✅ Configuré |
| CapCut Pro | `capcut` | 10.5.0 | ✅ Configuré |
| Dazz Cam Pro | `dazzcam` | 3.8.2 | ✅ Configuré |
| Delta Emulator | `delta` | 1.6.2 | ✅ Configuré |
| BeReal++ | `bereal` | 1.18.0 | ✅ Configuré |

## 🔐 Sécurité

### Vérification UDID

Le système vérifie que l'utilisateur a un certificat valide avant d'autoriser l'installation :

```javascript
// Dans ota-install.js
async function checkUDIDAuthorization() {
    const response = await fetch('/api/check-authorization');
    return response.authorized;
}
```

### Logging des installations

Chaque installation est enregistrée :
- Date/heure
- App installée
- Action (install/download)
- User agent
- Adresse IP

## ⚠️ Prérequis iOS

Pour que l'installation OTA fonctionne :

1. ✅ Serveur HTTPS (obligatoire)
2. ✅ Certificat SSL valide
3. ✅ UDID de l'appareil dans le profil de provisionnement
4. ✅ Application signée avec le bon certificat
5. ✅ Fichier manifest.plist correctement configuré

## 🐛 Dépannage

### "Impossible d'installer l'app"
- Vérifiez que l'UDID est dans le certificat
- Vérifiez que l'URL du manifest est en HTTPS
- Vérifiez que le fichier .ipa est signé correctement

### "Certificat non autorisé"
- L'utilisateur n'a pas acheté de certificat
- Son UDID n'est pas encore ajouté au profil

### "Téléchargement échoué"
- Vérifiez que le fichier .ipa existe dans /ipas/
- Vérifiez les permissions du fichier
- Vérifiez la taille du fichier (pas trop gros)

## 📊 API Endpoints

### Frontend

```javascript
// Installer une app
installApp('spotify', 'Spotify++')

// Télécharger IPA
downloadIPA('spotify', 'Spotify++')

// Vérifier autorisation
checkUDIDAuthorization()
```

### Backend

```
GET  /api/check-authorization           # Vérifier UDID
POST /api/installations/log             # Logger installation
GET  /api/admin/installations/stats     # Statistiques
POST /api/admin/refresh-manifests       # Rafraîchir manifests
```

## 🎨 Personnalisation

### Changer le design

Éditez `ota-install.css` pour personnaliser :
- Couleurs des boutons
- Animations
- Notifications
- Bannières d'avertissement

### Ajouter des fonctionnalités

Éditez `ota-install.js` pour ajouter :
- Système de favoris
- Historique d'installation
- Notes/avis des utilisateurs
- Mises à jour automatiques

## 📈 Prochaines étapes

- [ ] Implémenter système de mise à jour automatique
- [ ] Ajouter dashboard admin pour gérer les apps
- [ ] Système de notification push pour nouvelles apps
- [ ] Intégration paiement Revolut
- [ ] Système de gestion des versions d'apps
- [ ] API pour uploader les IPAs automatiquement

## 🤝 Support

En cas de problème, vérifiez :
1. Les logs du serveur Node.js
2. Les logs du navigateur (Console DevTools)
3. Le fichier `data/installations.json`
4. Les permissions des dossiers /ipas/ et /manifests/

---

**Note** : Ce système est conçu pour un usage avec un certificat Apple Developer Enterprise ou un système de signature d'applications légal. Assurez-vous de respecter les conditions d'utilisation d'Apple.
