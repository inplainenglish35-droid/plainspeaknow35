FROM node:20

WORKDIR /app

COPY Backend/server/package*.json ./
RUN npm install

COPY Backend/server .

RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]