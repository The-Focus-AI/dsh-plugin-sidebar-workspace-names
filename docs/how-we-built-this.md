# How this plugin was built

Two sessions, one day. The first (in the `claude-usage-esp32` app) took the plugin
from a one-line wish to a published-looking package; the second (in this repo) took it
from "is this published?" to a verified npm release, a screenshot, and a `0.1.1` bug fix.

| | Session A | Session B |
| --- | --- | --- |
| Where | `claude-usage-esp32` workspace | this repo |
| Title | "Show workspace name in sidebar list" | "Publication Status Inquiry" |
| Started | 2026-10-23 09:03 | 2026-10-23 10:20 |
| Turns / steps / tool calls | 7 / 163 / 156 | 10 / 210 / 239 |
| Outcome | plugin built, repo created, `0.1.0` prepared | `0.1.0` + `0.1.1` published, tagged, released |

![Rows before and after](before-after.png)

## The prompt it started from

> i want to be able to see the workspace name in the "in one list" veiew of the sessions
> on the sidebar

Nothing was scoped: no slot names, no file layout, no packaging decision.

## What I did

### 1. Found the seam instead of patching the app

The request named a visual element but no destination, which is exactly the case the
`cordis-plugin-development` skill covers, so that was loaded first and
`cordis-composition-reference` followed. Then I asked the running harness what it
exposes:

- `cordis_inspect_query` with `listSubTree` over `sidebar.*` slots to find a seat that
  survives re-render and exists in the flat view.
- Read `@deepseek-ai/dsh-client-ui-workspace` and `-ui-sidebar` (package manifest,
  README) to learn the row DOM: `[data-row-key="session:…"]` and its action strip.
- Read the installed `dsh-plugin-session-cost-pill` end to end as the working reference
  for a client bundle.

Two seats came out of this: `sidebar.workspaces.session.row.action` for the persistent
label and `sidebar.session.row.hover` for the full name in the hover card. No harness
source was touched.

### 2. Wrote a build-free bundle

At `claude-usage-esp32/dsh-plugins/sidebar-workspace-names`:

- `package.json` with `dsh.bundle.patch`, `dsh.client` (`platform: web`,
  `immediately: true`), `files`, `exports`, `engines.dsh`.
- `cordis.patch.yml` inserting the one host row.
- `index.js` — an empty `apply()`; the host half is deliberately a no-op.
- `client.js` — a classic script (`window.__ModuleLoader__.load`) with two slot
  registrations, a `LOCALES` map for `en`/`zh`, and a stylesheet whose every rule is
  scoped to flat-view rows.
- `locale/en.json`, `locale/zh.json`, `icon.svg`.

Installed into the `desktop` profile with the plugin-manager tool and verified the
client file loads as plain JavaScript (`node --check`).

### 3. Two lines, on request

The first version put the chip inline at the end of the row. The follow-up ("can you
make it on two lines?") turned each flat row into a 48px two-line row: title and
relative time stay on line one, the workspace name is absolutely positioned below it
(`inset-inline-start: 28px; top: 27px`) with a folder glyph and ellipsis. Grouped and
Workspace Tree views were explicitly excluded so their 32px layout stays intact.

### 4. Packaging and the repo

Asked "how is this best packaged?", I recommended the shape the ecosystem actually
uses — one small, build-free npm bundle installed per profile, modelled on
cost-pill — rather than a folder inside an application workspace or a compiled
package. Then, pointed at the usual Focus bootstrap, I applied the `setup-project`
skill / `GDE-011` scaffold from `The-Focus-AI/standards`: `mise.toml` (with `install`,
`dev`, `lint`, `test`, `deploy`, `publish`), `.pi/settings.json`, `skills-lock.json`,
`AGENTS.md`, `.gitignore`, markdownlint config, `LICENSE`, `README.md`, `CHANGELOG.md`,
tests. Public repo: `The-Focus-AI/dsh-plugin-sidebar-workspace-names`, version `0.1.0`,
with the desktop profile switched from a loose folder to `link:` on the repo.

## Follow-up prompts, in order

Session A (build), verbatim:

| Prompt | What it produced |
| --- | --- |
| "can you make it on two lines?" | 48px flat rows, chip below the title, hover strip preserved |
| "how is thie best packaged?" | build-free npm bundle recommendation, cost-pill as the model |
| "Yeah, let's create a new GitHub repo under the focus and go ahead and do that. look at the "create-project" action or script or whatever we'd use normally" | Focus scaffold, public repo, package rename to `dsh-plugin-sidebar-workspace-names`, `0.1.0` |
| "Actually for the graphs… zoom in and out on the graph…" | wrong window — no work done |
| "sorry that was the wrong window! go ahead with the create-proejct stuff" | resumed the repo work |
| "write a handoff down" | handoff note for the next session |

Session B (publish, verify, fix), verbatim:

| Prompt | What it produced |
| --- | --- |
| "is this published yet?" | No — npm 404, no tags, no releases; README still said "once published"; found a pre-existing `MD040` lint failure and a broken `~/.npm` cache |
| "i've logged in" | auth confirmed as `wschenk` via a temp cache; lint/test green; docs commit |
| *(pasted publish output)* | `0.1.0` staged, then live; tarball verified identical to the checkout; tag `v0.1.0` + GitHub release |
| "can we clean out the junk" | `npm unpublish …@0.0.0-stage` (needs 2FA, so the user ran it); registry left with one clean version |
| "ok that looks like it;s done" | verified: only `0.1.0`, tag and release untouched |
| "can you give me screenshows of before and after this plugin being enabled" | throwaway harness copies in `/tmp`, seed sessions, headless Chrome over CDP, forced *In one list*, before/after captures |
| "what about this deepseek harness app you are currently running in?" | native `screencapture` of the real desktop app — the GUI token blocks headless access |
| "yes lets fix it, and also update the README with the screenshot" | two CSS rules + three selector tests, README screenshot, `0.1.1` |
| "do i really need those 2 images? maybe the one is jsut fine" | dropped the close-up, re-cropped the pair to the sidebar edge |
| "lets do the other image" | kept the close-up instead, cropped per-panel to real row boundaries |
| *(pasted 0.1.1 publish output)* | verified integrity, tag `v0.1.1`, GitHub release |

## The bug the screenshots found

Producing the before/after pair surfaced a regression that shipped in `0.1.0`: **the
archive and pin buttons were visible on every flat row** instead of appearing on hover.

- The chip has to live in the row's always-mounted action strip, so the CSS forced the
  strip to stay displayed.
- The guard meant to hide the strip's other children
  (`> :not(.dsws-ws-chip):not(:has(.dsws-ws-chip))`) could not hide the wrapper that
  also contained the chip, so the buttons came along for the ride.
- Measured, not guessed: the pin button was **16×16** with the plugin and **0×0**
  without; after the fix it was **0×0** again while the chip stayed **216×16**.

The fix is two rules that target the buttons rather than their wrapper — hidden while
the chip is present, restored on `:hover` — plus tests that assert both rules exist and
that every stylesheet rule stays scoped to the flat list. Shipped as `0.1.1` with
[tests](https://github.com/The-Focus-AI/dsh-plugin-sidebar-workspace-names/blob/main/test/client.test.mjs)
covering name resolution and selector shape.

## Things worth remembering

- **npm staged publishes look like failures.** The first publish reported success but
  the registry showed only `0.0.0-stage` for a couple of minutes; `0.1.0` appeared at
  15:42Z and took `latest`. Don't unpublish during that window.
- **2FA cannot be delegated.** Publish and unpublish both need a TOTP or the browser
  flow; the agent can prepare everything and verify afterwards, but a human must run
  the two commands.
- **`~/.npm` had root-owned cache files**, so every npm write needed
  `npm_config_cache="$(mktemp -d)"`. `sudo chown -R 501:20 ~/.npm` fixes it properly.
- **The GUI needs its token.** `http://127.0.0.1:58688` without `?token=` returns
  "authentication required", so headless screenshots need either a throwaway instance's
  printed URL or a native `screencapture` of the real window.
- **Screenshots are a test.** They caught a regression the unit tests could not: the
  suite covers name resolution, not layout against another package's DOM.
