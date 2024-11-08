FROM oven/bun:1 AS base
WORKDIR /app
ENV DISCORD_TOKEN=
ADD . .
ENTRYPOINT bun run index.ts