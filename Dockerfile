# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
# next/image needs this on Alpine
RUN apk add --no-cache libc6-compat

# ---- Builder ----
FROM base AS builder
# Install deps
COPY package*.json ./
RUN npm ci
# Copy source
COPY . .
# Ensure Prisma client is generated (needed at runtime)
RUN npx prisma generate
# Build Next.js
RUN npm run build

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copy only what's needed to run
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/prisma /app/prisma
# (Optional) next.config.* is not required at runtime; build already used it.
# COPY --from=builder /app/next.config.js /app/
# Copy .env if your app expects it at runtime (DATABASE_URL, etc.)
COPY --from=builder /app/.env /app/.env

# Run DB migrations on container start, then boot the server
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p ${PORT}"]
