dev:
	bun install
	bun run --watch index.ts

start:
	bun install
	bun start
	echo "DISCORD_TOKEN=${DISCORD_TOKEN}" > .env