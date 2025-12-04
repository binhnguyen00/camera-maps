FROM node:22-alpine AS builder

WORKDIR /frontend

COPY .npmrc* package.json ./

ENV CI=true

RUN npm install -g pnpm && \
  pnpm install

COPY . .

RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 2999

CMD ["nginx", "-g", "daemon off;"]