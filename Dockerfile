FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node server.json glama.json README.md LICENSE ./
COPY --chown=node:node skills ./skills

USER node

ENTRYPOINT ["node", "dist/stdio.js"]
