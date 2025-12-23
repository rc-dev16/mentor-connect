#!/bin/bash
# Start script for Railway deployment
# Build is handled by Railway's build phase
PORT=${PORT:-8080}
# Use vite preview with explicit config
exec npx vite preview --host 0.0.0.0 --port $PORT --config vite.config.ts

