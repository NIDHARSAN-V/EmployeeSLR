

FROM node:20-slim  


WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY .env .env
RUN npm run build
CMD ["npm", "start"]