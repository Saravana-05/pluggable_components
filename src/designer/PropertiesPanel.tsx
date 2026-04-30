import { useStore } from '../store/designerStore'

const panel: React.CSSProperties = {
  width: 240,
  height: '100%',
  overflowY: 'auto',
  borderLeft: '1px solid #1e2130',
  background: '#13141f',
  padding: '14px 12px',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#4b5563',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 14,
}

const fieldWrap: React.CSSProperties = { marginBottom: 14 }

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#6b7280',
  marginBottom: 4,
  fontWeight: 500,
  textTransform: 'capitalize',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#1a1c2e',
  border: '1px solid #2e3148',
  borderRadius: 6,
  color: '#e5e7eb',
  fontSize: 12,
  padding: '6px 8px',
  outline: 'none',
}

const bindingInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontStyle: 'italic',
  color: '#818cf8',
  borderColor: 'rgba(99,102,241,0.4)',
}

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

const divider: React.CSSProperties = { borderTop: '1px solid #1e2130', margin: '16px 0' }

const deleteBtn: React.CSSProperties = {
  width: '100%',
  marginTop: 20,
  padding: '7px 0',
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: 6,
  color: '#f87171',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}

const bindingHint: React.CSSProperties = {
  fontSize: 10,
  color: '#4b5563',
  marginTop: 3,
  fontStyle: 'italic',
}

function isBinding(v: unknown): boolean {
  return typeof v === 'string' && /^\s*\{\{.+\}\}\s*$/.test(v)
}

function coerceBindableValue(raw: string): string | number | null {
  if (isBinding(raw)) return raw
  if (raw.trim() === '') return null
  const n = Number(raw)
  return isNaN(n) ? raw : n
}

interface PropertiesPanelProps {
  loader: { getMeta: (type: string) => any }
}

export function PropertiesPanel({ loader }: PropertiesPanelProps) {
  const selected          = useStore((s) => s.selected)
  const pages             = useStore((s) => s.pages)
  const currentPageId     = useStore((s) => s.currentPageId)
  const updateNodeProps   = useStore((s) => s.updateNodeProps)
  const updateNodeActions = useStore((s) => s.updateNodeActions)
  const deleteNode        = useStore((s) => s.deleteNode)

  const page    = pages.find((p) => p.id === currentPageId)
  const node    = page?.nodes.find((n) => n.id === selected)
  const rawMeta = node ? loader.getMeta(node.type) : null
  const meta    = rawMeta?.config ?? rawMeta
  const schema  = meta?.settings?.schema

  if (!node) {
    return (
      <div style={{ ...panel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#374151', fontSize: 12 }}>Select a component</span>
      </div>
    )
  }

  if (!schema) {
    return (
      <div style={panel}>
        <div style={sectionTitle}>{node.type}</div>
        <span style={{ color: '#374151', fontSize: 12 }}>No schema defined.</span>
      </div>
    )
  }

  const schemaProps: Record<string, any> = schema.properties ?? {}

  // locale removed — language is controlled globally via the canvas language selector
  const SKIP = new Set(['sparkData', 'labels', 'cards', 'locale'])

  return (
    <div style={panel}>
      <div style={sectionTitle}>{node.type} — Props</div>

      {Object.entries(schemaProps).map(([key, def]: [string, any]) => {
        if (SKIP.has(key)) return null

        const raw   = node.props[key]
        const value = raw ?? def.default ?? ''

        const isBindable =
          def['x-binding'] === true ||
          (Array.isArray(def.type) && def.type.includes('string') && def.type.includes('number'))

        if (def.type === 'array' && def.items?.enum) {
          const checked: string[] = Array.isArray(value) ? value : []
          return (
            <div key={key} style={fieldWrap}>
              <label style={labelStyle}>{key}</label>
              {(def.items.enum as string[]).map((opt) => (
                <label key={opt} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: '#9ca3af', marginBottom: 4, cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={checked.includes(opt)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...checked, opt]
                        : checked.filter((v) => v !== opt)
                      updateNodeProps(node.id, { [key]: next })
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )
        }

        if (def.type === 'string' && def.enum) {
          return (
            <div key={key} style={fieldWrap}>
              <label style={labelStyle}>{key}</label>
              <select
                style={selectStyle}
                value={value}
                onChange={(e) => updateNodeProps(node.id, { [key]: e.target.value })}
              >
                {(def.enum as string[]).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )
        }

        if (isBindable) {
          const displayValue = value === null || value === undefined ? '' : String(value)
          const looksLikeBinding = isBinding(displayValue)
          return (
            <div key={key} style={fieldWrap}>
              <label style={labelStyle}>{key}</label>
              <input
                style={looksLikeBinding ? bindingInputStyle : inputStyle}
                type="text"
                value={displayValue}
                placeholder={`number or {{binding}}`}
                onChange={(e) => {
                  const coerced = coerceBindableValue(e.target.value)
                  updateNodeProps(node.id, { [key]: coerced })
                }}
              />
              <div style={bindingHint}>Accepts a number or {'{{variable}}'}</div>
            </div>
          )
        }

        if (def.type === 'string') {
          return (
            <div key={key} style={fieldWrap}>
              <label style={labelStyle}>{key}</label>
              <input
                style={inputStyle}
                type="text"
                value={value}
                placeholder={`Enter ${key}…`}
                onChange={(e) => updateNodeProps(node.id, { [key]: e.target.value })}
              />
            </div>
          )
        }

        if (def.type === 'number') {
          return (
            <div key={key} style={fieldWrap}>
              <label style={labelStyle}>{key}</label>
              <input
                style={inputStyle}
                type="number"
                value={value === null ? '' : value}
                placeholder={`Enter ${key}…`}
                onChange={(e) => {
                  const n = e.target.value === '' ? null : parseFloat(e.target.value)
                  updateNodeProps(node.id, { [key]: isNaN(n as number) ? null : n })
                }}
              />
            </div>
          )
        }

        if (def.type === 'boolean') {
          return (
            <div key={key} style={fieldWrap}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: '#9ca3af', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => updateNodeProps(node.id, { [key]: e.target.checked })}
                />
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
              </label>
            </div>
          )
        }

        return null
      })}

      <div style={divider} />
      <div style={sectionTitle}>Actions</div>

      {['iconClick', 'buttonClick'].map((trigger) => {
        const action = node.actions?.[trigger]
        if (!action) return null
        return (
          <div key={trigger} style={{ marginBottom: 10 }}>
            <label style={labelStyle}>{trigger} → URL</label>
            <input
              style={inputStyle}
              value={action.url ?? ''}
              placeholder="/path"
              onChange={(e) =>
                updateNodeActions(node.id, { [trigger]: { ...action, url: e.target.value } })
              }
            />
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 5, fontSize: 11, color: '#6b7280', cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={action.target === '_blank'}
                onChange={(e) =>
                  updateNodeActions(node.id, {
                    [trigger]: { ...action, target: e.target.checked ? '_blank' : '_self' },
                  })
                }
              />
              Open in new tab
            </label>
          </div>
        )
      })}

      <div style={divider} />
      <div style={sectionTitle}>Position</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['x', 'y'] as const).map((axis) => (
          <div key={axis} style={{ flex: 1 }}>
            <label style={labelStyle}>{axis.toUpperCase()}</label>
            <input style={inputStyle} type="number" value={Math.round(node[axis])} readOnly />
          </div>
        ))}
      </div>

      <button style={deleteBtn} onClick={() => deleteNode(node.id)}>
        🗑 Delete node
      </button>
    </div>
  )
}