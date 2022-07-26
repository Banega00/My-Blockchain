FROM node:14.17.3-alpine as build-stage

ENV BACKEND_PORT = 3000
ENV ROOT_NODE_URL = http://192.168.1.10:3000
ENV P2P_PORT = 9000
ENV P2P_ROOT=192.168.1.10:9000
ENV IS_ROOT_NODE = false
ENV WALLET_DATA=blockchain-data
ENV COMMUNICATION_TYPE=P2P
ENV REACT_APP_BACKEND_PORT = 3000

WORKDIR /usr/src/app


COPY package*.json ./

copy src/frontend/package*.json ./src/frontend/

RUN npm ci --prefix ./src/frontend/

RUN npm ci

COPY . .

CMD ["npm","start"]
