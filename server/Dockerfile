FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install

COPY tsconfig.json ./
COPY server/ ./server/
COPY client/ ./client/

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npm run migrate -w server && node dist/server/src/main.js"]
