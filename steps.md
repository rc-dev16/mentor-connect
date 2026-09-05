# Migration Codebase Changes Tracker

This document lists all the codebase changes made during the migration from Railway to Interslice VPS / Open Ship.

## Changes Made:
- **Created `/Dockerfile`**: Added a multi-stage Dockerfile for the frontend SPA to build Vite assets and serve them via `server.js`.
- **Created `/backend/Dockerfile`**: Added a Dockerfile for the Express API backend, configuring the `/app/uploads` volume for Multer.
- **Created `/docker-compose.yml`**: Added a full-stack orchestration file specifying frontend, backend, and PostgreSQL services to enable easy 1-click deployments on Open Ship or any standard VPS.
- **Deleted `/nixpacks.toml`**: Removed Railway-specific deployment configuration.
