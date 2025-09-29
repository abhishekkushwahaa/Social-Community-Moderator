FROM node:18-alpine AS build
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN bun install

COPY . ./

RUN bun run build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]