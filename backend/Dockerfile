FROM node:18-alpine AS builder
WORKDIR /src/app

COPY package*.json ./
RUN bun install

COPY . .

RUN bunx prisma generate

FROM node:18-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules

COPY --from=builder /usr/src/app .

EXPOSE 3001

CMD ["node", "index.js"]