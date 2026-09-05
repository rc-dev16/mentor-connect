# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
# Create uploads directory for Multer
RUN mkdir -p uploads && chown -R node:node uploads

EXPOSE 5001
CMD ["node", "src/server.js"]
