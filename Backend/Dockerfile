FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN cp pdfFormattingExtractor.cjs dist/pdfFormattingExtractor.cjs

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]