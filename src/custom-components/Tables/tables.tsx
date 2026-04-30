// TableX/tables.tsx
// - title, emptyMessage, showingLabel  → resolved by withMultiLang (same as CardX)
// - columns and rows                   → read from tableStore (Zustand)
// - column headers and row key values  → resolved from languageStore (Zustand)

import { useEffect } from 'react'
import { useLangStore }  from '../../store/languageStore'
import { useTableStore } from '../../store/tableStore'
import { loadTranslation } from '../../i18n/loader'

const MODULE = 'tablex'

interface TableXProps {
  // Passed by CanvasItem — used to look up data in tableStore
  nodeId: string

  // Resolved by withMultiLang wrapper
  title?:        string
  emptyMessage?: string
  showingLabel?: string

  // defaultProps columns/rows — used ONLY to initialise tableStore on first render
  columns?: any[]
  rows?:    any[]

  // Display options
  striped?:     boolean
  bordered?:    boolean
  compact?:     boolean
  showHeader?:  boolean
  showTitle?:   boolean
  maxRows?:     number
  accentColor?: 'indigo' | 'green' | 'amber' | 'cyan' | 'red'
}

const accent = {
  indigo: '#818cf8', green: '#4ade80',
  amber:  '#fbbf24', cyan:  '#22d3ee', red: '#f87171',
}

export default function TableX({
  nodeId,
  title        = 'Table',
  emptyMessage = 'No data available.',
  showingLabel = 'Showing',
  columns:      defaultColumns = [],
  rows:         defaultRows    = [],
  striped      = true,
  bordered     = false,
  compact      = false,
  showHeader   = true,
  showTitle    = true,
  maxRows,
  accentColor  = 'indigo',
}: TableXProps) {

  // ── Read from Zustand stores ───────────────────────────────────────────────
  const { languages, langOrder, translations, addTranslation } = useLangStore()

  const initTable  = useTableStore(s => s.initTable)
  const clearTable = useTableStore(s => s.clearTable)

  // Read columns and rows for THIS table instance by nodeId
  const columns = useTableStore(s => s.columns[nodeId] ?? [])
  const rows    = useTableStore(s => s.rows[nodeId]    ?? [])

  // ── Initialise tableStore with defaultProps on first render ───────────────
  // After init, any update goes through tableStore directly
  useEffect(() => {
    if (nodeId) {
      initTable(nodeId, defaultColumns, defaultRows)
    }
    // Cleanup when component is removed from canvas
    return () => { if (nodeId) clearTable(nodeId) }
  }, [nodeId])

  // ── Load tablex translations for all active languages ─────────────────────
  useEffect(() => {
    languages.forEach(async (lang) => {
      if (!translations[MODULE]?.[lang]) {
        const data = await loadTranslation(MODULE, lang)
        addTranslation(MODULE, lang, data)
      }
    })
  }, [languages.join(',')])

  // ── Resolve a translation key → "English / தமிழ்" ────────────────────────
  const resolve = (key: string): string =>
    langOrder
      .filter(l => languages.includes(l))
      .map(l =>
        translations[MODULE]?.[l]?.[key] ||
        translations[MODULE]?.['en']?.[key] ||
        key
      )
      .filter(Boolean)
      .join(' / ')

  // ── Render ────────────────────────────────────────────────────────────────
  const color     = accent[accentColor] ?? accent.indigo
  const rowHeight = compact ? 32 : 44
  const fontSize  = compact ? 12 : 13
  const displayed = maxRows ? rows.slice(0, maxRows) : rows

  return (
    <div style={{
      fontFamily: 'sans-serif', background: '#1e2130',
      borderRadius: 12, overflow: 'hidden', minWidth: 320,
      border: bordered ? `1px solid ${color}44` : '1px solid #2e3148',
    }}>

      {/* Title */}
      {showTitle && title && (
        <div style={{
          padding: '12px 16px 10px', borderBottom: '1px solid #2e3148',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>{title}</span>
          {rows.length > 0 && (
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              {showingLabel} {displayed.length} / {rows.length}
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {rows.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
          {emptyMessage}
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize }}>

            {/* Header — headerKey resolved from languageStore */}
            {showHeader && columns.length > 0 && (
              <thead>
                <tr style={{ background: '#161824' }}>
                  {columns.map((col, i) => (
                    <th key={col.key ?? i} style={{
                      padding: compact ? '8px 12px' : '10px 16px',
                      textAlign: col.align ?? 'left', color,
                      fontWeight: 600, fontSize: fontSize - 1,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      borderBottom: `1px solid ${color}33`,
                      width: col.width ?? 'auto', whiteSpace: 'nowrap',
                    }}>
                      {col.headerKey ? resolve(col.headerKey) : col.header ?? col.key}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Rows — Key-suffixed cells resolved from languageStore */}
            <tbody>
              {displayed.map((row, rowIdx) => (
                <tr key={rowIdx} style={{
                  background: striped && rowIdx % 2 === 1
                    ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderBottom: rowIdx < displayed.length - 1
                    ? '1px solid #2e3148' : 'none',
                  height: rowHeight, transition: 'background 0.1s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${color}10`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background =
                      striped && rowIdx % 2 === 1
                        ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                >
                  {columns.map((col, colIdx) => {
                    const keyProp  = `${col.key}Key`
                    const cellValue = row[keyProp]
                      ? resolve(row[keyProp])
                      : row[col.key] ?? '—'
                    return (
                      <td key={colIdx} style={{
                        padding: compact ? '6px 12px' : '10px 16px',
                        textAlign: col.align ?? 'left',
                        color: '#e5e7eb', verticalAlign: 'middle',
                      }}>
                        {cellValue}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}