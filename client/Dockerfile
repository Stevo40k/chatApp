# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/

RUN npm install

COPY tsconfig.json ./
COPY client/ ./client/

RUN cd client && npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build-stage /app/client/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
