FROM node:latest
WORKDIR /app
COPY . .
RUN npx -y bun install
VOLUME /app/configs
ENTRYPOINT npx -y bun run index.ts