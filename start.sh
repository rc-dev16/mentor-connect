#!/bin/bash
# Start script for Railway deployment
# Build is handled by Railway's build phase
PORT=${PORT:-8080}
exec vite preview --host 0.0.0.0 --port $PORT

