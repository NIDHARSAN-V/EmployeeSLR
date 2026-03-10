# Change FROM node:18 to node:20 or node:22
FROM node:20-slim  
# or node:22-slim, node:20-alpine, etc.

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]