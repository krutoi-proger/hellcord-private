FROM oven/bun:1 AS base
WORKDIR /app
ADD . .
RUN ["bun", "install"]
ENTRYPOINT [ "bun", "run", "index.ts"]