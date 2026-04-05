#!/bin/sh
echo "Starting Gunicorn..."
gunicorn --worker-class eventlet --workers 1 --bind "0.0.0.0:${PORT}" wsgi:app