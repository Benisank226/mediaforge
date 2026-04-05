FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Vérifier que le provider est bien installé
RUN pip show bgutil-ytdlp-pot-provider && echo "Provider installed"

COPY . .

RUN chmod +x start.sh

ENV PORT=5000
EXPOSE $PORT

CMD ["./start.sh"]