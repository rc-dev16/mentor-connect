# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Note: Ensure VITE_CLERK_PUBLISHABLE_KEY and VITE_API_BASE_URL are provided at build time 
# or via Open Ship environment variables so Vite can bake them into the static bundle.
RUN npm run build

# Production server
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

EXPOSE 8080
CMD ["node", "server.js"]
