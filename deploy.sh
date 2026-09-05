#!/bin/bash
# Deployment script triggered by GitHub Actions
set -e

echo "Starting deployment..."
cd /root/mentor-connect

echo "Pulling latest code from GitHub..."
git pull origin main

echo "Rebuilding and restarting Docker containers..."
sudo docker compose build
sudo docker compose up -d

echo "Deployment completed successfully!"
