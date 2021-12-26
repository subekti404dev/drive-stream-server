FROM alpine

RUN apk add --update nodejs yarn git

WORKDIR /app
COPY package.json .
RUN yarn install --production && yarn cache clean
COPY . .

EXPOSE 3001
CMD [ "node", "server.js" ]