FROM node:20

WORKDIR /app

# ✅ FIXED PATHS
COPY server/package*.json ./
RUN npm install

COPY server ./

RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]