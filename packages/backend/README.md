## Backend for the Nordcraft Engine

### Install

In the root of the project:

```sh
bun install
```

### Run

The `dev` command has a `predev` command that copies static files into the `assets/_static` directory (see [syncStaticAssets.js](/bin/syncStaticAssets.js)). This is necessary for the example application to work. Please make sure you build the static assets before running the application (see above).

```sh
bun run dev
```

To use a different project, replace the json file in the `__project__` folder.

### Status

This package is still in development but will be part of the new infrastructure for the Nordcraft Engine.
