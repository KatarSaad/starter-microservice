# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Copy necessary files from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/docker-entrypoint.sh ./

# Install production dependencies ONLY
RUN npm install --only=production --legacy-peer-deps
RUN chmod +x docker-entrypoint.sh

EXPOSE 1000

# Use entrypoint script for production, or direct command for development
CMD ["./docker-entrypoint.sh"]