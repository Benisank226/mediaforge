#!/data/data/com.termux/files/usr/bin/bash

echo "=== MediaForge Installation ==="
echo "Mise à jour des paquets..."
pkg update -y && pkg upgrade -y

echo "Installation de Python, pip, ffmpeg et yt-dlp..."
pkg install -y python python-pip ffmpeg

echo "Installation des dépendances Python..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Vérification de yt-dlp..."
pip install -U yt-dlp

echo "Création des dossiers nécessaires..."
mkdir -p uploads downloads converted static/img

echo "=== Démarrage de MediaForge ==="
echo "Accède à http://localhost:5000 dans ton navigateur"
echo "Pour arrêter, tape Ctrl+C"

python app.py