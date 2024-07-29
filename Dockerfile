FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

ENTRYPOINT ["node", "/usr/src/app/lib/index.js"]
