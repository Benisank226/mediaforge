#!/bin/sh
echo "Starting PO Token provider..."
# Lancer le provider via la commande installée par pip
bgutil-ytdlp-pot-provider server &
PROVIDER_PID=$!
sleep 5
echo "PO Token provider started (PID: $PROVIDER_PID)"
echo "Starting Gunicorn..."
gunicorn --worker-class eventlet --workers 1 --bind "0.0.0.0:${PORT}" wsgi:app