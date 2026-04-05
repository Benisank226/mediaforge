FROM python:3.11-slim

# Installation de ffmpeg uniquement
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=5000
EXPOSE $PORT

# Le provider PO Token est installé via pip, pas besoin de Node.js
CMD ["gunicorn", "--worker-class", "eventlet", "--workers", "1", "--bind", "0.0.0.0:$PORT", "wsgi:app"]