FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --include=dev --no-audit --no-fund

COPY . .

RUN npm run build


FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve@14.2.6

COPY --from=build /app/dist ./dist

ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "serve -s dist/frontend/browser -l tcp://0.0.0.0:${PORT}"]