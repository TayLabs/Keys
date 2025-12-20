FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache git
RUN npm install
COPY . ./
RUN npm run build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]