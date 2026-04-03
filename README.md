# MediaForge

MediaForge est une plateforme multimédia tout-en-un : téléchargeur, convertisseur, éditeur MP3, créateur de GIF, extracteur de sous-titres, etc. Elle fonctionne entièrement dans un navigateur et peut être installée sur Termux (Android) ou tout serveur Linux.

## Fonctionnalités

- **Téléchargement** depuis YouTube, TikTok, Instagram, X et plus de 1000 sites (via yt-dlp)
- **Conversion** vidéo, audio, image (MP4, MKV, MP3, FLAC, WEBP, AVIF…)
- **Éditeur MP3** : modification des tags ID3 (titre, artiste, album, genre, pochette)
- **Sous-titres** : extraction en SRT, VTT, ASS
- **GIF Maker** : création de GIFs animés optimisés (palette FFmpeg)
- **Compression d'images** avec contrôle qualité
- **Fusion audio/vidéo**
- **File d'attente persistante** et annulation des tâches
- **Interface glassmorphism**, responsive, PWA installable
- **Multi-langue** (français, anglais, espagnol, arabe)

## Installation sur Termux (Android)

1. Installe Termux depuis F-Droid ou le site officiel.
2. Ouvre Termux et exécute :

```bash
pkg update -y
pkg install git python ffmpeg -y
git clone https://github.com/ton-utilisateur/mediaforge.git
cd mediaforge
chmod +x start.sh
./start.sh