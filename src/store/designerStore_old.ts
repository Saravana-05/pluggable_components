// src/store/designerStore.ts
import { create } from 'zustand'

const GRID = 20
const snap = (v: number) => Math.round(v / GRID) * GRID

export const useStore = create((set, get) => ({
  pages: [{ id: 'page-1', nodes: [] }],
  currentPageId: 'page-1',
  selected: null,

  addNode: (n: any) =>
    set((s: any) => ({
      pages: s.pages.map((p: any) =>
        p.id === s.currentPageId
          ? { ...p, nodes: [...p.nodes, n] }
          : p
      )
    })),

  updateNode: (id: string, updates: any) =>
    set((s: any) => ({
      pages: s.pages.map((p: any) => ({
        ...p,
        nodes: p.nodes.map((n: any) =>
          n.id === id
            ? {
                ...n,
                ...updates,
                x: updates.x ? snap(updates.x) : n.x,
                y: updates.y ? snap(updates.y) : n.y
              }
            : n
        )
      }))
    })),

  select: (id: string) => set({ selected: id }),

  switchPage: (id: string) => set({ currentPageId: id }),

  addPage: () =>
    set((s: any) => ({
      pages: [
        ...s.pages,
        { id: `page-${s.pages.length + 1}`, nodes: [] }
      ]
    }))
}))