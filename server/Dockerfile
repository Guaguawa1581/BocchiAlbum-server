FROM node:18-alpine3.17
RUN apk add --update --no-cache nano
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node","app.js"]