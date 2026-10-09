FROM node:24-bookworm-slim
WORKDIR /app
COPY . .
RUN npm ci && npm run api:build && npm run server:build
USER node
CMD ["node", "apps/backend/dist/main.js"]
