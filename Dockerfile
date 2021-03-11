FROM node:10.18.1-stretch

WORKDIR /home/node

COPY . .

#post install geth package for platform
RUN npm set unsafe-perm true

RUN npm install

ENV PATH /home/node/node_modules/.bin:${PATH}
EXPOSE 8545 8545
EXPOSE 8546 8546

ENTRYPOINT ["./cli.js"]
