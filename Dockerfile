FROM node:22 as base
WORKDIR /app

COPY package*.json ./

FROM base as dev

RUN npm i

COPY . .

CMD ["npm","run","dev"]


FROM base as prod

RUN npm install --only=production

COPY . .
RUN npm install -g @nestjs/cli
CMD ["npm","run","start"]