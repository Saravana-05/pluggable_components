import { useStore } from '../store/designerStore'

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#2a2d3a',
  border: '1px solid #3a3d4a',
  borderRadius: 5,
  padding: '6px 8px',
  fontSize: 13,
  color: '#e5e7eb',
  outline: 'none',
  boxSizing: 'border-box',
}

export function SettingsPanel({ loader }: any) {
  const currentPageId = useStore((s: any) => s.currentPageId)
  const page = useStore((s: any) =>
    s.pages.find((p: any) => p.id === currentPageId)
  )
  const selected = useStore((s: any) => s.selected)
  const update = useStore((s: any) => s.updateNode)

  const node = page?.nodes.find((n: any) => n.id === selected)
  if (!node) return null

  const meta = loader.getMeta(node.type)
  if (!meta) return null

  const properties: Record<string, any> = meta.settings?.schema?.properties ?? {}

  function handleChange(key: string, value: any) {
    update(node.id, { props: { ...node.props, [key]: value } })
  }

  return (
    <div style={{
      width: 260,
      minWidth: 260,
      height: '100%',
      borderLeft: '1px solid #2a2d3a',
      background: '#1a1c24',
      padding: '12px',
      overflowY: 'auto',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      <p style={{
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#6b7280',
        marginBottom: 14,
      }}>
        {node.type} — settings
      </p>

      {Object.entries(properties).map(([key, schema]: any) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block',
            fontSize: 11,
            color: '#9ca3af',
            marginBottom: 5,
            textTransform: 'capitalize',
          }}>
            {key}
          </label>

          {/* Boolean → checkbox */}
          {schema.type === 'boolean' && (
            <input
              type="checkbox"
              checked={node.props[key] ?? false}
              onChange={(e) => handleChange(key, e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#6366f1' }}
            />
          )}

          {/* Enum → select dropdown */}
          {schema.enum && (
            <select
              value={node.props[key] ?? schema.enum[0]}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ ...inputBase, cursor: 'pointer' }}
            >
              {schema.enum.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {/* String (no enum) → text input */}
          {schema.type === 'string' && !schema.enum && (
            <input
              style={inputBase}
              value={node.props[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          )}

          {/* Number → number input */}
          {schema.type === 'number' && (
            <input
              type="number"
              style={inputBase}
              value={node.props[key] ?? 0}
              onChange={(e) => handleChange(key, Number(e.target.value))}
            />
          )}
        </div>
      ))}

      {Object.keys(properties).length === 0 && (
        <p style={{ fontSize: 12, color: '#6b7280' }}>No settings for this component.</p>
      )}
    </div>
  )
}
