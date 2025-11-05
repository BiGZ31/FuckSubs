# 🔐 Guide de Signature des Applications iOS

## Vue d'ensemble

Ce guide explique comment signer vos applications iOS avec votre certificat pour qu'elles puissent être installées via OTA.

## 📋 Prérequis

1. **Certificat Apple Developer** (fichier .p12)
2. **Profil de provisionnement** (.mobileprovision) contenant tous les UDIDs autorisés
3. **Applications non signées** (fichiers .ipa)
4. **Outil de signature** : zsign (recommandé) ou similaire

## 🛠️ Installation de zsign

### Sur macOS :
```bash
# Installer avec Homebrew
brew install zsign

# Ou compiler depuis les sources
git clone https://github.com/zhlynn/zsign.git
cd zsign
g++ *.cpp -o zsign -framework Foundation -framework Security
sudo cp zsign /usr/local/bin/
```

### Sur Linux :
```bash
git clone https://github.com/zhlynn/zsign.git
cd zsign
chmod +x INSTALL.sh
./INSTALL.sh
```

### Sur Windows :
```bash
# Utiliser WSL (Windows Subsystem for Linux) ou
# Télécharger zsign.exe depuis les releases GitHub
```

## 📝 Processus de signature

### Étape 1 : Préparer les certificats

```bash
# Structure des fichiers
certs/
├── certificate.p12        # Votre certificat Apple
└── profile.mobileprovision # Profil avec tous les UDIDs
```

### Étape 2 : Signer une application

```bash
# Commande de base
zsign -k certificate.p12 -m profile.mobileprovision -o signed.ipa original.ipa

# Avec mot de passe du certificat
zsign -k certificate.p12 -p "votre_mot_de_passe" -m profile.mobileprovision -o signed.ipa original.ipa

# Avec bundle ID personnalisé
zsign -k certificate.p12 -m profile.mobileprovision -b com.votre.bundle.id -o signed.ipa original.ipa
```

### Étape 3 : Vérifier la signature

```bash
# Extraire le .ipa
unzip signed.ipa -d extracted

# Vérifier la signature
codesign -dvvv extracted/Payload/*.app

# Vérifier le profil
security cms -D -i extracted/Payload/*.app/embedded.mobileprovision
```

## 🔄 Workflow complet

### Quand un nouveau client achète :

```bash
#!/bin/bash
# Script : resign-all-apps.sh

# 1. Variables
CERT="certs/certificate.p12"
PROFILE="certs/profile.mobileprovision"
APPS_DIR="ipas"
ORIGINAL_DIR="apps-original"

# 2. Créer le nouveau profil avec l'UDID ajouté
# (Téléchargé depuis Apple Developer Portal)

# 3. Re-signer toutes les applications
for app in $ORIGINAL_DIR/*.ipa; do
    appname=$(basename "$app" .ipa)
    echo "Signing $appname..."
    
    zsign -k "$CERT" -m "$PROFILE" -o "$APPS_DIR/$appname.ipa" "$app"
    
    if [ $? -eq 0 ]; then
        echo "✅ $appname signed successfully"
    else
        echo "❌ Failed to sign $appname"
    fi
done

echo "🎉 All apps signed!"
```

### Rendre le script exécutable :
```bash
chmod +x resign-all-apps.sh
./resign-all-apps.sh
```

## 📱 Applications à signer

Liste des apps disponibles et où les trouver :

| App | Bundle ID | Source |
|-----|-----------|--------|
| Spotify++ | com.spotify.client | [AppDB](https://appdb.to) |
| YouTube++ | com.google.ios.youtube | [AppDB](https://appdb.to) |
| Deezer++ | com.deezer.Deezer | [AppDB](https://appdb.to) |
| TikTok++ | com.zhiliaoapp.musically | [AppDB](https://appdb.to) |
| Instagram++ | com.burbn.instagram | [AppDB](https://appdb.to) |
| CapCut Pro | com.lemon.lvideo | IPA Library |
| Dazz Cam Pro | com.dazz.cam | IPA Library |
| Delta Emulator | com.rileytestut.Delta | [GitHub](https://github.com/rileytestut/Delta) |
| BeReal++ | com.bereal.app | [AppDB](https://appdb.to) |

## 🔐 Gérer les certificats

### Exporter un certificat depuis Xcode :

1. Ouvrir Keychain Access
2. Catégorie "Mes certificats"
3. Clic droit sur votre certificat Developer
4. Exporter > Format .p12
5. Définir un mot de passe

### Créer un profil de provisionnement :

1. Se connecter à [Apple Developer](https://developer.apple.com)
2. Certificates, Identifiers & Profiles
3. Profiles > (+) New
4. Choisir "Ad Hoc" ou "In House"
5. Sélectionner votre App ID
6. Ajouter tous les UDIDs
7. Télécharger le .mobileprovision

### Ajouter un UDID au profil :

```bash
# 1. Aller sur Apple Developer Portal
# 2. Devices > (+) Register Device
# 3. Entrer l'UDID du client
# 4. Aller dans Profiles
# 5. Modifier votre profil et cocher le nouvel appareil
# 6. Télécharger le nouveau profil
# 7. Re-signer toutes les apps avec le nouveau profil
```

## 🚀 Automatisation

### Script Python pour automatiser :

```python
#!/usr/bin/env python3
import os
import subprocess
import sys

def sign_app(original_ipa, output_ipa, cert, profile):
    """Sign an iOS app"""
    cmd = [
        'zsign',
        '-k', cert,
        '-m', profile,
        '-o', output_ipa,
        original_ipa
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ {os.path.basename(output_ipa)} signed successfully")
        return True
    else:
        print(f"❌ Failed: {result.stderr}")
        return False

def main():
    CERT = "certs/certificate.p12"
    PROFILE = "certs/profile.mobileprovision"
    APPS_DIR = "ipas"
    ORIGINAL_DIR = "apps-original"
    
    # Liste des apps à signer
    apps = [
        'spotify', 'youtube', 'deezer', 'tiktok',
        'youtubemusic', 'instagram', 'capcut',
        'dazzcam', 'delta', 'bereal'
    ]
    
    os.makedirs(APPS_DIR, exist_ok=True)
    
    for app in apps:
        original = f"{ORIGINAL_DIR}/{app}.ipa"
        output = f"{APPS_DIR}/{app}.ipa"
        
        if not os.path.exists(original):
            print(f"⚠️  {original} not found, skipping...")
            continue
        
        print(f"📝 Signing {app}...")
        sign_app(original, output, CERT, PROFILE)
    
    print("\n🎉 Signing process complete!")

if __name__ == "__main__":
    main()
```

### Utiliser le script :
```bash
python3 sign_apps.py
```

## ⚙️ Configuration avancée

### Changer le Bundle ID :
```bash
zsign -k cert.p12 -m profile.mobileprovision -b com.nouveau.bundle.id -o signed.ipa original.ipa
```

### Injecter des tweaks/modifications :
```bash
# 1. Extraire l'IPA
unzip original.ipa -d extracted

# 2. Ajouter votre dylib dans extracted/Payload/App.app/
cp tweak.dylib extracted/Payload/App.app/

# 3. Re-compresser
cd extracted
zip -r ../modified.ipa .
cd ..

# 4. Signer
zsign -k cert.p12 -m profile.mobileprovision -o signed.ipa modified.ipa
```

### Modifier le nom de l'app :
```bash
# Modifier le Info.plist avant de signer
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'Nouveau Nom'" extracted/Payload/App.app/Info.plist
```

## 📊 Vérification de la validité

### Vérifier les UDIDs dans le profil :
```bash
security cms -D -i profile.mobileprovision > profile.xml
grep -A 1 "UDID" profile.xml
```

### Vérifier la date d'expiration :
```bash
security cms -D -i profile.mobileprovision | grep -A 2 "ExpirationDate"
```

## 🐛 Résolution de problèmes

### Erreur : "Failed to verify code signature"
- Vérifiez que le certificat n'a pas expiré
- Vérifiez le mot de passe du .p12

### Erreur : "Provisioning profile doesn't include UDID"
- Ajoutez l'UDID à votre profil sur Apple Developer
- Re-téléchargez le profil

### Erreur : "Code object is not signed at all"
- L'app n'a pas été signée correctement
- Re-signez avec zsign

### L'app se ferme immédiatement après installation
- Vérifiez que l'UDID est bien dans le profil
- Vérifiez que le certificat est valide
- Vérifiez que l'app est compatible avec la version iOS

## 📚 Ressources

- [zsign GitHub](https://github.com/zhlynn/zsign)
- [Apple Developer Portal](https://developer.apple.com)
- [AppDB - IPA Source](https://appdb.to)
- [iOS App Signer (GUI)](https://dantheman827.github.io/ios-app-signer/)

## 🔄 Maintenance

### Tâches régulières :

1. **Mensuel** : Vérifier l'expiration du certificat
2. **Hebdomadaire** : Mettre à jour les apps avec les nouvelles versions
3. **Après chaque achat** : Ajouter UDID et re-signer les apps
4. **Annuel** : Renouveler le certificat Apple Developer

---

**Important** : Gardez vos certificats et profils en sécurité. Ne les partagez jamais publiquement.
