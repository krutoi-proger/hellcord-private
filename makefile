dev:
	bun install
	bun run --watch index.ts

build:
	bun install
	bun build --target node --minify --outdir dist index.ts
	cp package.json dist
	echo "DISCORD_TOKEN=${DISCORD_TOKEN}" > dist/.env