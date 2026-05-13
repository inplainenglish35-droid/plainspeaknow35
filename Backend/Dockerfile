FROM node:20

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server ./server

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/dist/index.js"]