import { useDraggable } from '@dnd-kit/core'

// ─── PresetTile ───────────────────────────────────────────────────────────────

interface PresetTileProps {
  componentType: string
  preset: {
    id: string
    label: string
    thumbnail: string
    defaultProps: Record<string, any>
    defaultActions?: Record<string, any>
  }
}

function PresetTile({ componentType, preset }: PresetTileProps) {
  const draggableId = `preset::${componentType}::${preset.id}`

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: draggableId,
    data: { componentType, preset },
  })

  // ── Component-aware prop pills ────────────────────────────────────────────
  const pills: string[] = []
  const p = preset.defaultProps

  if (Array.isArray(p.visibleFields)) {
    const fieldLabels: Record<string, string> = {
      image: 'img', badge: 'badge', description: 'desc',
    }
    pills.push('title')
    p.visibleFields.forEach((f: string) => pills.push(fieldLabels[f] ?? f))

  } else if ('trendValue' in p || 'value' in p) {
    // StatCard
    if (p.label)         pills.push(String(p.label).slice(0, 12))
    if (p.value != null) pills.push(`${p.value}${p.unit ?? ''}`)
    if (p.trendValue != null && p.trendValue !== 0)
      pills.push(p.trendValue > 0 ? `+${p.trendValue}%` : `${p.trendValue}%`)
    if (p.accentColor)   pills.push(p.accentColor)

    // Show which languages are configured
    if (p.i18n && typeof p.i18n === 'object') {
      const langs = Object.keys(p.i18n)
      if (langs.length > 0) pills.push(langs.join(' / '))
    }

  } else {
    const SKIP = new Set(['sparkData', 'imageUrl', 'locale', 'labels', 'visibleFields', 'i18n'])
    for (const [key, val] of Object.entries(p)) {
      if (SKIP.has(key) || val === '' || val == null || typeof val === 'object') continue
      const strVal = String(val)
      pills.push(typeof val === 'boolean' ? `${key}: ${val}` : strVal.length <= 12 ? strVal : key)
      if (pills.length >= 4) break
    }

    // Append language pill for any component that has i18n
    if (p.i18n && typeof p.i18n === 'object') {
      const langs = Object.keys(p.i18n)
      if (langs.length > 0) pills.push(langs.join(' / '))
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`Drag to canvas — ${preset.label}`}
      style={{
        padding: '10px 12px',
        marginBottom: 8,
        background: isDragging ? '#252840' : '#1a1c2e',
        border: '1px solid #2e3148',
        borderRadius: 10,
        cursor: 'grab',
        opacity: isDragging ? 0.45 : 1,
        transition: 'background 0.15s, opacity 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>
          {preset.thumbnail || '🧩'}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 13, color: '#e5e7eb',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {preset.label}
          </div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>{componentType}</div>
        </div>
      </div>

      {pills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {pills.map((pill) => (
            <FieldPill key={pill} label={pill} />
          ))}
        </div>
      )}
    </div>
  )
}

function FieldPill({ label }: { label: string }) {
  // Language pills (contain "/") get a distinct teal tint
  const isLangPill = label.includes('/')
  return (
    <span style={{
      fontSize: 10, padding: '2px 6px', borderRadius: 20,
      background: isLangPill ? 'rgba(34,211,238,0.12)' : 'rgba(99,102,241,0.15)',
      color: isLangPill ? '#22d3ee' : '#818cf8',
      border: `1px solid ${isLangPill ? 'rgba(34,211,238,0.3)' : 'rgba(99,102,241,0.3)'}`,
      fontWeight: 500,
      maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis',
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {label}
    </span>
  )
}

// ─── ComponentSidebar ─────────────────────────────────────────────────────────

interface ComponentMeta {
  name: string
  category?: string
  presets?: PresetTileProps['preset'][]
}

interface ComponentSidebarProps {
  loader: {
    getAllMeta: () => ComponentMeta[] | Record<string, ComponentMeta> | ComponentMeta
  }
}

function normaliseMeta(
  raw: ReturnType<ComponentSidebarProps['loader']['getAllMeta']>
): ComponentMeta[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && 'name' in raw && typeof (raw as any).name === 'string')
    return [raw as ComponentMeta]
  if (typeof raw === 'object')
    return Object.values(raw as Record<string, ComponentMeta>)
  return []
}

export function ComponentSidebar({ loader }: ComponentSidebarProps) {
  const allMeta = normaliseMeta(loader.getAllMeta())

  const grouped = allMeta.reduce<Record<string, ComponentMeta[]>>((acc, meta) => {
    const cat = meta.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(meta)
    return acc
  }, {})

  const hasAnything = allMeta.some((m) => (m.presets?.length ?? 0) > 0)

  return (
    <div style={{
      width: 220, height: '100%', overflowY: 'auto',
      borderRight: '1px solid #1e2130', background: '#13141f',
      padding: '12px 10px', boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#4b5563',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 14, paddingLeft: 2,
      }}>
        Components
      </div>

      {!hasAnything && (
        <div style={{ fontSize: 12, color: '#374151', paddingLeft: 2, lineHeight: 1.6 }}>
          No components loaded.<br />Check your loader.
        </div>
      )}

      {Object.entries(grouped).map(([category, components]) => {
        const tiles = components.flatMap((meta) => meta.presets ?? [])
        if (tiles.length === 0) return null

        return (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: '#374151',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 8, paddingLeft: 2,
            }}>
              {category}
            </div>

            {components.map((meta) =>
              (meta.presets ?? []).map((preset) => (
                <PresetTile
                  key={`${meta.name}-${preset.id}`}
                  componentType={meta.name}
                  preset={preset}
                />
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}