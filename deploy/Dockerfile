FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run api:build && npm run server:build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/game-server/package.json ./apps/game-server/package.json
COPY --from=build /app/apps/game-server/dist ./apps/game-server/dist
USER node
CMD ["node", "apps/backend/dist/main.js"]
