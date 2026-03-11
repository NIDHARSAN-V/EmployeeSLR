FROM node:20-slim

WORKDIR /app


COPY package*.json ./
COPY tsconfig.json ./


RUN npm install


COPY src ./src
COPY .env .env  

RUN npx tsc

EXPOSE 8000


CMD ["node", "dist/server.js"]




