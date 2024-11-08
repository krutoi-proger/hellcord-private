FROM oven/bun:1 AS base
WORKDIR /app
ENV DISCORD_TOKEN=
ADD . .
RUN bun install
ENTRYPOINT bun run index.ts