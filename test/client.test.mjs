import assert from 'node:assert/strict'
import test from 'node:test'

// The client bundle is a classic script: it calls the page's module loader at load
// time. Stub that entry point, then hand the factory a minimal React stub so the
// pure helpers can be exercised in Node without a browser.
let entry
globalThis.window = {
  __ModuleLoader__: {
    load(spec) {
      entry = spec
    },
  },
}

await import('../client.js')

assert.equal(entry.id, 'dsh-plugin-sidebar-workspace-names')
assert.equal(typeof entry.factory, 'function')

const plugin = entry.factory((id) => {
  if (id === 'react') return { createElement: () => null }
  throw new Error(`unexpected module: ${id}`)
})

const t = (key) => key

const workspaces = [
  { workspaceId: 'w1', title: 'acme', sessionIds: ['s1', 's3'] },
  { workspaceId: 'w2', title: 'other', sessionIds: ['s2'] },
]

test('resolves the owning workspace by session membership', () => {
  assert.equal(plugin.resolveName(workspaces, 's2', t), 'other')
  assert.equal(plugin.resolveName(workspaces, 's3', t), 'acme')
})

test('falls back to Ungrouped for a session outside every workspace', () => {
  assert.equal(plugin.resolveName(workspaces, 'missing', t), 'ungrouped')
})

test('falls back to Ungrouped before membership loads', () => {
  assert.equal(plugin.resolveName(undefined, 's1', t), 'ungrouped')
  assert.equal(plugin.resolveName([], 's1', t), 'ungrouped')
})

test('localizes the automatic default workspace title', () => {
  const items = [{ workspaceId: 'default', title: 'default-workspace', sessionIds: ['s1'] }]
  assert.equal(plugin.resolveName(items, 's1', t), 'defaultWorkspace')
})

test('treats an empty stored title as Ungrouped', () => {
  const items = [{ workspaceId: 'w1', title: '', sessionIds: ['s1'] }]
  assert.equal(plugin.resolveName(items, 's1', t), 'ungrouped')
})

test('tolerates a workspace view without a session list', () => {
  const items = [{ workspaceId: 'w1', title: 'acme' }]
  assert.equal(plugin.resolveName(items, 's1', t), 'ungrouped')
})

test('registers the chip and hover seats', () => {
  const registrations = []
  const ctx = {
    effect(callback) {
      callback()
      return () => {}
    },
    locale: {
      register() {
        return () => {}
      },
    },
    slots: {
      inject(_owner, callback) {
        callback()
      },
      register(options) {
        registrations.push(options)
        return () => {}
      },
    },
  }
  globalThis.document = {
    createElement: () => ({ dataset: {}, textContent: '', remove() {} }),
    head: { appendChild() {} },
  }

  plugin.apply(ctx)

  assert.deepEqual(
    registrations.map((options) => [options.name, options.id]),
    [
      ['sidebar.workspaces.session.row.action', 'workspace-name'],
      ['sidebar.session.row.hover', 'workspace-name'],
    ],
  )
})
