FROM node:20-bookworm-slim AS deps

WORKDIR /app/server

# Only copy backend package manifests so Docker can cache npm install
COPY server/package*.json ./

# Install only production dependencies (there are no dev deps yet but keep flag)
RUN npm install --omit=dev

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app/server

# Copy installed node_modules first to leverage Docker layer caching
COPY --from=deps /app/server/node_modules ./node_modules

# Copy the backend source
COPY server/. .

EXPOSE 3001

CMD ["node", "index.js"]
