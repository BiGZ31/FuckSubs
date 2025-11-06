# Downloads Folder

Ce dossier contient les fichiers de certificats que les clients téléchargent après que leur commande soit marquée comme "complétée".

## Structure des fichiers

Pour chaque commande, les fichiers suivants doivent être générés:

1. **certificate-{orderId}.p12** - Le certificat Apple signé
2. **profile-{orderId}.mobileprovision** - Le profil de provisionnement contenant l'UDID du client
3. **guide-installation.pdf** - Guide d'installation (partagé entre tous les clients)

## Comment ajouter des fichiers pour une commande

Lorsqu'un admin marque une commande comme "completed", il doit:

1. Générer le certificat .p12 avec Apple Developer
2. Créer le profil .mobileprovision incluant l'UDID du client
3. Nommer les fichiers selon le format: `certificate-{orderId}.p12` et `profile-{orderId}.mobileprovision`
4. Placer les fichiers dans ce dossier `/downloads`

## Fichiers de démo

Actuellement, ce dossier contient des fichiers de démo pour tester l'interface. En production, remplacez-les par de vrais fichiers générés automatiquement.

## Sécurité

⚠️ **IMPORTANT**: En production, ne stockez PAS les certificats directement sur le serveur web. Utilisez:
- AWS S3 avec signed URLs
- Azure Blob Storage
- Google Cloud Storage
- Ou tout autre service de stockage sécurisé

Les liens de téléchargement doivent être temporaires et authentifiés.
