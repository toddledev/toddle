## Cloudflare example application

### Install

```sh
bun install
```

### Run

The `dev` command has a `predev` command that copies static files into the `assets/_static` directory (see [syncStaticAssets.js](/scripts/syncStaticAssets.js)). This is necessary for the example application to work. Please make sure you build the static assets before running the application (see above).

```sh
bun run dev
```

To use a different project, replace the json file in the `__project__` folder.

### Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/toddledev/toddle)
