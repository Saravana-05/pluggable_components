/**
 * designerStore.ts
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NodeAction {
  type: 'redirect' | 'emit' | 'custom'
  url?: string
  target?: string
  event?: string
  handler?: (node: DesignerNode) => void
}

export interface DesignerNode {
  id: string
  type: string
  x: number
  y: number
  props: Record<string, any>
  actions: Record<string, NodeAction>
}

export interface DesignerPage {
  id: string
  label: string
  nodes: DesignerNode[]
}

export interface DesignerState {
  pages: DesignerPage[]
  currentPageId: string | null
  selected: string | null

  setCurrentPage: (pageId: string) => void
  select: (nodeId: string | null) => void

  addNode: (
    componentType: string,
    preset: {
      defaultProps: Record<string, any>
      defaultActions?: Record<string, NodeAction>
    },
    position: { x: number; y: number }
  ) => void

  updateNodeProps:   (nodeId: string, patch: Record<string, any>) => void
  updateNodeActions: (nodeId: string, patch: Record<string, NodeAction>) => void
  moveNode:          (nodeId: string, x: number, y: number) => void
  deleteNode:        (nodeId: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deep-clone any JSON-serialisable value.
 * Using JSON round-trip intentionally: it drops `undefined`, `function`, etc.
 * which is exactly what we want for plain data props.
 * Binding strings like "{{activeProjects}}" survive perfectly.
 */
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function mapNodes(
  state: DesignerState,
  nodeId: string,
  updater: (n: DesignerNode) => DesignerNode
): Partial<DesignerState> {
  return {
    pages: state.pages.map((p) => ({
      ...p,
      nodes: p.nodes.map((n) => (n.id === nodeId ? updater(n) : n)),
    })),
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<DesignerState>((set, get) => ({
  pages: [{ id: 'page-1', label: 'Page 1', nodes: [] }],
  currentPageId: 'page-1',
  selected: null,

  setCurrentPage: (pageId) => set({ currentPageId: pageId, selected: null }),

  select: (nodeId) => set({ selected: nodeId }),

  // ── addNode ───────────────────────────────────────────────────────────────
  //
  // IMPORTANT: deepClone() is used instead of spread so that:
  //   • Nested objects / arrays (e.g. the `cards` array) are fully independent.
  //   • Binding strings like "{{activeProjects}}" are preserved exactly as-is.
  //   • Shallow spread ( { ...preset.defaultProps } ) would share nested refs
  //     between nodes AND would not prevent later coercion by the panel.
  //
  addNode: (componentType, preset, position) => {
    const newNode: DesignerNode = {
      id:      `${componentType}-${nanoid(6)}`,
      type:    componentType,
      x:       position.x,
      y:       position.y,
      // ✅ deep clone — binding strings survive, nested arrays are independent
      props:   deepClone(preset.defaultProps),
      actions: deepClone(preset.defaultActions ?? {}),
    }

    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === state.currentPageId
          ? { ...p, nodes: [...p.nodes, newNode] }
          : p
      ),
      selected: newNode.id,
    }))
  },

  // ── updateNodeProps ───────────────────────────────────────────────────────
  //
  // Accepts the raw string from an input — caller must NOT coerce to number.
  // If the value looks like "{{binding}}" it is stored as a string.
  // If the value is a plain number it is stored as a number.
  // The decision belongs to PropertiesPanel, not the store.
  //
  updateNodeProps: (nodeId, patch) =>
    set((state) =>
      mapNodes(state, nodeId, (n) => ({
        ...n,
        props: { ...n.props, ...patch },
      }))
    ),

  updateNodeActions: (nodeId, patch) =>
    set((state) =>
      mapNodes(state, nodeId, (n) => ({
        ...n,
        actions: { ...n.actions, ...patch },
      }))
    ),

  moveNode: (nodeId, x, y) =>
    set((state) =>
      mapNodes(state, nodeId, (n) => ({ ...n, x, y }))
    ),

  deleteNode: (nodeId) =>
    set((state) => ({
      pages: state.pages.map((p) => ({
        ...p,
        nodes: p.nodes.filter((n) => n.id !== nodeId),
      })),
      selected: state.selected === nodeId ? null : state.selected,
    })),
}))