FROM node:18-alpine

WORKDIR /usr/src/app

# Install build deps if needed
COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
