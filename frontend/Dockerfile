FROM node:22-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g @vue/cli
COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "serve"]