# ----------------------------------------------------
# Stage 1: Build & Install dependencies
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY src/package*.json ./

# Installer uniquement les dépendances de prod
RUN npm ci --only=production

# ----------------------------------------------------
# Stage 2: Hardened Runtime Image
# ----------------------------------------------------
FROM node:20-alpine

# Bonne pratique : Node environment en production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copier uniquement les node_modules de prod depuis le builder
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node src/ .

# Règle d'or de sécurité : Passer sur l'utilisateur non-root "node"
USER node

EXPOSE 3000

CMD ["node", "app.js"]
