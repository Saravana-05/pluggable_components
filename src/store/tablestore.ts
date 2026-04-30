import { create } from 'zustand'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TableColumn {
  key:       string
  headerKey?: string  // translation key for column header
  header?:   string  // plain header fallback
  width?:    number
  align?:    'left' | 'center' | 'right'
}

export interface TableRow {
  [key: string]: any  // plain values or Key-suffixed translation keys
}

interface TableState {
  // nodeId → columns for that table instance
  columns: Record<string, TableColumn[]>
  // nodeId → rows for that table instance
  rows: Record<string, TableRow[]>

  // Actions
  setColumns: (nodeId: string, columns: TableColumn[]) => void
  setRows:    (nodeId: string, rows: TableRow[])       => void
  initTable:  (nodeId: string, columns: TableColumn[], rows: TableRow[]) => void
  clearTable: (nodeId: string) => void
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useTableStore = create<TableState>((set) => ({
  columns: {},
  rows:    {},

  // Set columns for a specific table node
  setColumns: (nodeId, columns) =>
    set((state) => ({
      columns: { ...state.columns, [nodeId]: columns },
    })),

  // Set rows for a specific table node
  setRows: (nodeId, rows) =>
    set((state) => ({
      rows: { ...state.rows, [nodeId]: rows },
    })),

  // Initialise both columns and rows at once (called on first render)
  initTable: (nodeId, columns, rows) =>
    set((state) => ({
      columns: { ...state.columns, [nodeId]: columns },
      rows:    { ...state.rows,    [nodeId]: rows    },
    })),

  // Remove a table node's data when it's deleted from canvas
  clearTable: (nodeId) =>
    set((state) => {
      const nextCols = { ...state.columns }
      const nextRows = { ...state.rows }
      delete nextCols[nodeId]
      delete nextRows[nodeId]
      return { columns: nextCols, rows: nextRows }
    }),
}))