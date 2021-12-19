FROM alpine

RUN apk add --update nodejs yarn git

WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
CMD [ "node server" ]