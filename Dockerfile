FROM node:18-alpine as build

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the service port

# Wait for MySQL service to be ready (optional, you may need to add a custom script for this)
RUN npx prisma generate
RUN npx prisma db push
RUN npm run build
WORKDIR /app/dist
EXPOSE 1000

# Run the application
CMD ["npm", "run", "start:dev"]
