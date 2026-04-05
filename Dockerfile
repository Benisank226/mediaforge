FROM python:3.11-slim

# Installation de ffmpeg, curl et Node.js
RUN apt-get update && apt-get install -y ffmpeg curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du reste du code
COPY . .

# Installation globale du provider PO Token (npm)
RUN npm install -g bgutil-ytdlp-pot-provider

ENV PORT=5000
EXPOSE $PORT

# Démarrage du provider en arrière-plan, puis Gunicorn
CMD ["sh", "-c", "bgutil-ytdlp-pot-provider server & gunicorn --worker-class eventlet --workers 1 --bind 0.0.0.0:$PORT wsgi:app"]