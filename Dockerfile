FROM node:15.11.0-alpine3.10

WORKDIR /home/node

RUN apk add curl
COPY . .

#post install geth package for platform
RUN npm set unsafe-perm true

RUN npm install

ENV PATH /home/node/node_modules/.bin:${PATH}
EXPOSE 8545 8545
EXPOSE 8546 8546

ENTRYPOINT ["./cli.js"]
