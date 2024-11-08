FROM node:22.11.0
WORKDIR /app
COPY . .
RUN npx -y bun install
VOLUME /app/configs
ENTRYPOINT npx -y bun run index.ts
# Test