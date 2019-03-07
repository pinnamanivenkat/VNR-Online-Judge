FROM node:8-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --quiet

COPY . ./

CMD ["npm", "start"]
