## Hono example application

### Install

```sh
bun install
```

### Run

The `dev` command has a `predev` command that copies static files into the `assets/_static` directory (see [syncStaticAssets.js](/scripts/syncStaticAssets.js)). This is necessary for the Hono example application to work. Please make sure you build the static assets before running the application (see above).

```sh
bun run dev
```

Currently, this example uses the `serveStatic` middleware from `@hono/node-server` to serve static files. This means that this project relies on node.js. Another example will cover how to run an application without node.js (on Cloudflare for instance).

To pick a different project template (see 'examples/projects/`):

```sh
template=medium bun run dev
```

open http://localhost:3030
