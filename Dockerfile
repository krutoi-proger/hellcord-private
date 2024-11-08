FROM oven/bun:1 AS base
WORKDIR /app
COPY . .
RUN ping 8.8.8.8
RUN bun install
ENTRYPOINT bun run index.ts