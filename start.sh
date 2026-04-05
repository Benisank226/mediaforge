#!/bin/sh
echo "Starting PO Token provider..."
python -m bgutil_ytdlp_pot_provider.server &
PROVIDER_PID=$!
sleep 3
echo "PO Token provider started (PID: $PROVIDER_PID)"
echo "Starting Gunicorn..."
gunicorn --worker-class eventlet --workers 1 --bind "0.0.0.0:${PORT}" wsgi:app
