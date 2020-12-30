FROM node:12-alpine

# this makes the build fail in travis ! see https://github.com/nodejs/docker-node/issues/661
# RUN npm install --global yarn


COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . . 

ENV NODE_ENV=production

EXPOSE 3001
CMD yarn start
