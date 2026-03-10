FROM node:20-slim

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code and env file
COPY src ./src
COPY .env .env  
# This is crucial!

# Compile all TypeScript files using tsconfig
RUN npx tsc

EXPOSE 8000

CMD ["node", "dist/server.js"]