# toddle - the open-source visual frontend framework

Create highly performant web apps with SSR, branching, version control, components, and much more! Visit [toddle.dev](https://toddle.dev?utm_medium=web&utm_source=GitHub) to learn more.

[Discord](https://discord.com/invite/svBKYZf3UR) | [BlueSky](https://bsky.app/profile/toddle.dev) | [YouTube](https://youtube.com/@toddledev) | [LinkedIn](https://www.linkedin.com/company/toddledev) | [X](https://x.com/toddledev/)

![Test status](https://github.com/toddledev/toddle/actions/workflows/test.yml/badge.svg)

## Introduction

This repository holds different packages that are used internally by the toddle framework. The packages that are currently available are:

- [core](https://www.npmjs.com/package/@toddledev/core) 👈 holds core (shared) logic used by the other packages
- [runtime](https://www.npmjs.com/package/@toddledev/runtime) 👈 includes logic for hydrating/running/updating a toddle application on the front-end
- [ssr](https://www.npmjs.com/package/@toddledev/ssr) 👈 holds part of the server-side rendering logic
- [lib](https://www.npmjs.com/package/@toddledev/std-lib) 👈 holds all builtin [formulas](https://toddle.dev/docs/formula-editor) and [actions](https://toddle.dev/docs/workflows) used by the runtime and during ssr
- [search](https://www.npmjs.com/package/@toddledev/search) 👈 holds all issue rules and search functionality for traversing a toddle project. This powers the issue panel in the toddle editor in a web worker atm

## Requirements

Install using [bun](https://bun.sh/) by running `bun install`

### Commands

- Lint: `bun lint`
- Check types: `bun typecheck`
- Test: `bun test`

## Status

While we consume all packages internally in the toddle framework, this project is currently in development and is not yet ready for other applications to consume.

## Plan

As [announced in July '24](https://toddle.dev/blog/toddle-is-soon-open-source), toddle is going open source. The goal is to move more and more code into this repository and make it possible to self host a toddle application.

We're currently working on moving more and more of the server-side rendering logic into this repository. This means that most updates are going to be in the ssr package for the time being.

## Dependencies

The dependencies between the packages are as follows:

- `core` is a dependency for all other packages
- `ssr` is a dependency for `search`

## Releases

Currently, we're not using GitHub releases, but once the repository is more mature, we will start using them. We do release to npm atm though, which is also where we consume packages from internally.

To release a new version to npm:

1. Update the version in the root `package.json` file
2. Create a PR
3. Once the PR is merged, it will automatically release all packages to npm

## Contributing

If you find a bug or have an idea for a new feature, please open an issue. We also welcome pull requests. We are actively monitoring this repository.

If you have any questions, feel free to ask them in our [Discord](https://discord.com/invite/svBKYZf3UR) or reach out by [e-mail](mailto:hello@toddle.dev)

## Local development

To consume all packages locally, it's useful to run `bun run link` in the root of the repository. This will use `bun link` on all packages in the repository.

Other than that, the best way to test atm is to use the hono example.
