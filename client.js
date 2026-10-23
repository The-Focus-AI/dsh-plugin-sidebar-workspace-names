window.__ModuleLoader__.load({
  id: 'dsh-plugin-sidebar-workspace-names',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'sidebarWorkspaceNames'

    /** Visible copy for the two seats; the rest of the bundle is language-neutral. */
    const LOCALES = {
      en: {
        ungrouped: 'Ungrouped',
        defaultWorkspace: 'Default workspace',
        hoverLabel: 'Workspace',
      },
      zh: {
        ungrouped: '未分组',
        defaultWorkspace: '默认工作区',
        hoverLabel: '工作区',
      },
    }

    /**
     * The row's action strip is hidden by the shipped stylesheet until the row
     * is hovered. It is the only always-mounted seat on a session row, so in
     * the flat ("In one list") view it carries the workspace chip: the row
     * grows to two lines, the title keeps the first line, and the chip is
     * absolutely positioned below it, aligned with the title text. The strip's
     * own buttons keep their shipped hover behavior on the first line. Grouped
     * views are untouched — their workspace headers already name the
     * workspace — and the flat-view selectors key off the row's parent, which
     * in the grouped tree is the Workspace section that also holds the
     * workspace row.
     */
    const CSS = `
:not(div:has(> [data-row-key^="workspace:"])) > [data-row-key^="session:"]:has(.dsws-ws-chip) {
  position: relative;
  box-sizing: border-box;
  height: 48px;
  align-items: flex-start;
  padding-top: 4px;
}
:not(div:has(> [data-row-key^="workspace:"])) > [data-row-key^="session:"] > span:has(.dsws-ws-chip) { display: inline-flex; }
:not(div:has(> [data-row-key^="workspace:"])) > [data-row-key^="session:"] > span:has(.dsws-ws-chip) > :not(.dsws-ws-chip):not(:has(.dsws-ws-chip)) { display: none; }
:not(div:has(> [data-row-key^="workspace:"])) > [data-row-key^="session:"]:hover > span:has(.dsws-ws-chip) > :not(.dsws-ws-chip):not(:has(.dsws-ws-chip)) { display: inline-flex; }
div:has(> [data-row-key^="workspace:"]) .dsws-ws-chip { display: none !important; }
:not(div:has(> [data-row-key^="workspace:"])) > [data-row-key^="session:"]:has(.dsws-ws-chip) .dsws-ws-chip {
  position: absolute;
  inset-inline-start: 28px;
  top: 27px;
  max-width: calc(100% - 36px);
  display: flex;
  align-items: center;
  gap: 3px;
  pointer-events: none;
}
.dsws-ws-chip { min-width: 0; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dsws-ws-chip-icon { flex: none; opacity: .75; }
.dsws-ws-chip-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsws-ws-hover { display: flex; gap: 6px; min-width: 0; font-size: 12px; line-height: 16px; }
.dsws-ws-hover-label { flex: none; color: #adb2b8; }
.dsws-ws-hover-name { min-width: 0; color: #cfd3d6; overflow-wrap: anywhere; }
`

    /**
     * Resolve the display name of the workspace that owns one session.
     * @param {Array<{ sessionIds?: string[], title?: string }> | undefined} items
     * @param {string} sessionId
     * @param {(key: string) => string} t
     * @returns {string}
     */
    function resolveName(items, sessionId, t) {
      if (!Array.isArray(items)) return t('ungrouped')
      const owner = items.find(
        (item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId),
      )
      if (owner === undefined) return t('ungrouped')
      if (owner.title === 'default-workspace') return t('defaultWorkspace')
      if (typeof owner.title === 'string' && owner.title !== '') return owner.title
      return t('ungrouped')
    }

    /**
     * Subscribe to the workspace membership the slot owner exposes. The
     * selector reads only the snapshot slices this row needs, so a membership
     * change re-renders the affected rows and other rows keep their names.
     * @param {(selector: (state: any) => unknown) => unknown} useWorkspaces
     * @param {string} sessionId
     * @param {(key: string) => string} t
     * @returns {string | null} the name, or null while membership is unresolved.
     */
    function useOwnerName(useWorkspaces, sessionId, t) {
      const phase = useWorkspaces((state) => state.phase)
      const items = useWorkspaces((state) => state.items)
      if (!Array.isArray(items)) return null
      if (phase !== undefined && phase !== 'ready') return null
      return resolveName(items, sessionId, t)
    }

    function FolderGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 11,
          height: 11,
          'aria-hidden': true,
          className: 'dsws-ws-chip-icon',
        },
        h('path', {
          d: 'M1.6 4.4h4.2l1.3 1.4h7.3v6.4a1 1 0 0 1-1 1H2.6a1 1 0 0 1-1-1V5.4a1 1 0 0 1 1-1z',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinejoin: 'round',
        }),
      )
    }

    /**
     * Workspace chip on the second line of one flat-view session row. The
     * row's action strip is the always-mounted seat; because the chip is
     * positioned out of that strip, the strip keeps its shipped hover buttons
     * on the first line while the name stays readable below the title.
     */
    function WorkspaceChip({ sessionId, useWorkspaces, t }) {
      const name = useOwnerName(useWorkspaces, sessionId, t)
      if (name === null) return null
      return h(
        'span',
        { className: 'dsws-ws-chip', 'data-workspace-chip': name },
        h(FolderGlyph),
        h('span', { className: 'dsws-ws-chip-name' }, name),
      )
    }

    /**
     * Workspace line inside the session hover card, between the relative time
     * and the trailing status lines. This is the untruncated name and works in
     * every browsing mode.
     */
    function WorkspaceHover({ sessionId, useWorkspaces, t }) {
      const name = useOwnerName(useWorkspaces, sessionId, t)
      if (name === null) return null
      return h(
        'div',
        { className: 'dsws-ws-hover', 'data-workspace-hover': name },
        h('span', { className: 'dsws-ws-hover-label' }, t('hoverLabel')),
        h('span', { className: 'dsws-ws-hover-name' }, name),
      )
    }

    function apply(ctx) {
      ctx.effect(
        () => ctx.locale.register(NS, LOCALES),
        'sidebar-workspace-names: dictionaries',
      )
      ctx.effect(() => {
        const style = document.createElement('style')
        style.dataset.plugin = 'dsh-plugin-sidebar-workspace-names'
        style.textContent = CSS
        document.head.appendChild(style)
        return () => style.remove()
      }, 'sidebar-workspace-names: styles')

      ctx.slots.inject('sidebar.workspaces.session.row.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.workspaces.session.row.action',
            id: 'workspace-name',
            order: -100,
            locale: NS,
          },
          WorkspaceChip,
        ),
      )

      ctx.slots.inject('sidebar.session.row.hover', () =>
        ctx.slots.register(
          {
            name: 'sidebar.session.row.hover',
            id: 'workspace-name',
            order: 5,
            locale: NS,
          },
          WorkspaceHover,
        ),
      )
    }

    return { inject: ['slots', 'locale'], apply, resolveName }
  },
})
