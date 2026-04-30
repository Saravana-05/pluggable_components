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
  compact?: boolean
}

function PresetTile({ componentType, preset, compact = false }: PresetTileProps) {
  const draggableId = `preset::${componentType}::${preset.id}`

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: draggableId,
    data: { componentType, preset },
  })

  // ── Compact (2-col grid) tile for Buttons ─────────────────────────────────
  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        title={`Drag to canvas — ${preset.label}`}
        style={{
          background:   isDragging ? '#252840' : '#1a1c2e',
          border:       '1px solid #2e3148',
          borderRadius: 8,
          padding:      '8px 6px',
          cursor:       'grab',
          opacity:      isDragging ? 0.45 : 1,
          transition:   'background 0.15s, opacity 0.15s',
          userSelect:   'none',
          textAlign:    'center',
        }}
      >
        <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 4 }}>
          {preset.thumbnail || '🧩'}
        </div>
        <div style={{
          fontSize:     11,
          fontWeight:   600,
          color:        '#e5e7eb',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
        }}>
          {preset.label}
        </div>
      </div>
    )
  }

  // ── Normal (single column) tile for everything else ───────────────────────
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`Drag to canvas — ${preset.label}`}
      style={{
        padding:      '10px 12px',
        marginBottom: 8,
        background:   isDragging ? '#252840' : '#1a1c2e',
        border:       '1px solid #2e3148',
        borderRadius: 10,
        cursor:       'grab',
        opacity:      isDragging ? 0.45 : 1,
        transition:   'background 0.15s, opacity 0.15s',
        userSelect:   'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>
          {preset.thumbnail || '🧩'}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight:   600,
            fontSize:     13,
            color:        '#e5e7eb',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}>
            {preset.label}
          </div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>{componentType}</div>
        </div>
      </div>
    </div>
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
  if (typeof raw === 'object' && 'name' in raw && typeof (raw as any).name === 'string') {
    return [raw as ComponentMeta]
  }
  if (typeof raw === 'object') {
    return Object.values(raw as Record<string, ComponentMeta>)
  }
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
      width:       220,
      height:      '100%',
      overflowY:   'auto',
      borderRight: '1px solid #1e2130',
      background:  '#13141f',
      padding:     '12px 10px',
      boxSizing:   'border-box',
    }}>
      <div style={{
        fontSize:      11,
        fontWeight:    700,
        color:         '#4b5563',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom:  14,
        paddingLeft:   2,
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

        const isButtonCategory = category === 'Buttons'

        return (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize:      10,
              fontWeight:    600,
              color:         '#374151',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom:  8,
              paddingLeft:   2,
            }}>
              {category}
            </div>

            {/* 2-col grid for Buttons, normal list for everything else */}
            {isButtonCategory ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {components.map((meta) =>
                  (meta.presets ?? []).map((preset) => (
                    <PresetTile
                      key={`${meta.name}-${preset.id}`}
                      componentType={meta.name}
                      preset={preset}
                      compact
                    />
                  ))
                )}
              </div>
            ) : (
              components.map((meta) =>
                (meta.presets ?? []).map((preset) => (
                  <PresetTile
                    key={`${meta.name}-${preset.id}`}
                    componentType={meta.name}
                    preset={preset}
                  />
                ))
              )
            )}
          </div>
        )
      })}
    </div>
  )
}