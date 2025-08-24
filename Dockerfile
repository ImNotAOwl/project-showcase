# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
ENV CI=1
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate || true
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN mkdir -p /app/public/uploads

# Copie l'output standalone + assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Démarrage: push Prisma (Mongo) puis serveur
CMD ["/bin/sh", "-c", "npx prisma db push && node server.js"]
