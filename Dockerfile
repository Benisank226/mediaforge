FROM python:3.11-slim

# Installation de ffmpeg (indispensable pour les conversions)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Définition du répertoire de travail
WORKDIR /app

# Copie des dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie de tout le code source
COPY . .

# Variable d'environnement pour le port
ENV PORT=5000
EXPOSE $PORT

# Commande de démarrage avec Gunicorn (nécessaire pour SocketIO)
CMD ["gunicorn", "--worker-class", "eventlet", "--bind", "0.0.0.0:$PORT", "wsgi:app"]