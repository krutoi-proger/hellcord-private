FROM oven/bun:1 AS base
WORKDIR /app
COPY . .
ENTRYPOINT bun install && bun run index.ts