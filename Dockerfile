FROM node:15.11-buster-slim

RUN apt-get update && apt-get install -y \
    curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /home/node

COPY . .

#post install geth package for platform
RUN npm set unsafe-perm true
RUN npm install

ENV PATH /home/node/node_modules/.bin:${PATH}
EXPOSE 8545 8546 30303 30303/udp

ENTRYPOINT ["./cli.js"]