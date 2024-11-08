FROM oven/bun AS base
WORKDIR /app
COPY . .
RUN bun install
VOLUME /app/configs
ENTRYPOINT bun run index.ts