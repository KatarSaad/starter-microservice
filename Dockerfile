# Base image
FROM node:18-alpine as build

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the service port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start:dev"]
