# Project agent guide

This project follows TheFocus.AI standards and is a
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) client plugin
bundle. Agents should optimize for durable, maintainable changes; keep tooling
reproducible; and write down decisions that future agents need.

## First files to read

1. `AGENTS.md` — this file.
2. `README.md` — what the plugin does, install, and known limits.
3. `client.js` — the whole browser half: slot registrations, CSS, and name resolution.
4. `package.json` — the `dsh.bundle.patch` and `dsh.client` manifest and the engine pin.
5. `mise.toml` — tools and required tasks.

## Required operating rules

- Start setup with `mise trust`, `mise install`, and `mise run install`.
- Use mise for project tools and runtimes. Do not use global `npm install -g`, `pip install`,
  or `brew install` for project tooling.
- Keep these mise tasks available: `mise install`, `mise dev`, `mise lint`, `mise test`,
  and `mise deploy`.
- This package has **no secrets**, so it intentionally has no `fnox.toml` or
  `secrets:*` tasks.
- Keep the plugin dependency-free. It has no runtime dependencies and no build step; do
  not add a bundler or generated `lib/` output.

## Plugin rules

- `client.js` is loaded into the page as a **classic script** through
  `window.__ModuleLoader__.load`. It must stay plain JavaScript with JSDoc types; do
  not convert it to an ES module or add a compilation step.
- Contribute through the two declared slots, with `ctx.slots.inject(...)` and
  `ctx.slots.register(...)`:
  - `sidebar.workspaces.session.row.action` — the workspace chip.
  - `sidebar.session.row.hover` — the full workspace name in the hover card.
- Read session and workspace data through the slot standard props (`useWorkspaces`), not
  by subscribing to stores or folding session events.
- Keep every stylesheet rule scoped to `[data-row-key^="session:"]` and the flat view.
  Grouped and Workspace Tree rows must keep their shipped 32px layout and must not gain
  the chip.
- The placement depends on ui-workspace's row DOM. When changing selectors, update
  `README.md` (Known limits), `CHANGELOG.md`, and bump the version. Widen or narrow
  `engines.dsh` deliberately.
- Keep visible copy in `client.js`'s `LOCALES` map and the Plugin Manager metadata in
  `locale/en.json` and `locale/zh.json` in sync.

## Planning and issue workflow

- Prefer GitHub Issues when the repo has a GitHub remote and `gh` is authenticated.
- Issues should be small enough for one agent to complete independently, with context,
  acceptance criteria, and test expectations.
- Update `README.md` and `CHANGELOG.md` when behavior, setup, or compatibility changes.

## Quality bar

- Run `mise lint` and `mise test` before declaring work complete.
- If a command cannot be run, say why and describe the risk.
- Do not claim visual verification of the sidebar layout without a browser; the tests
  cover name resolution only.
