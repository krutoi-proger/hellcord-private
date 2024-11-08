FROM oven/bun AS base
WORKDIR /app
COPY . .
RUN cat /etc/resolve.conf
RUN bun install
VOLUME /app/configs
ENTRYPOINT bun run index.ts