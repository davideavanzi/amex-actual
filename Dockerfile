FROM node:23.11.0

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "src/job.js"]
