FROM node:17-bullseye-slim AS BUILDER
WORKDIR /usr/src/app
RUN apt update && apt install --no-install-recommends --no-install-suggests -y git ca-certificates python3 python3-pip make build-essential
RUN git clone https://github.com/tejado/telegram-nearby-map .
RUN npm install

FROM node:17-bullseye-slim as FINAL
WORKDIR /usr/src/app
COPY --from=BUILDER /usr/src/app ./
COPY default.js ./config.js
EXPOSE 3000
CMD npm start
