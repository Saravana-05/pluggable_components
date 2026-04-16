import { useDraggable } from '@dnd-kit/core'
import { Toolbox } from './Toolbox'

function SidebarItem({ name, comp }: { name: string; comp: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${name}`,
    data: { type: name },
  })

  const icon = comp.config?.ui?.icon ?? comp.ui?.icon ?? null

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.4 : 1,
        padding: '8px 12px',
        marginBottom: 4,
        background: '#22253a',
        border: '1px solid #2e3148',
        borderRadius: 8,
        cursor: 'grab',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#2a2d45'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#4a4f72'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#22253a'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#2e3148'
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#1a1c2e',
          border: '1px solid #2e3148',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon ? (
          <img src={icon} alt={name} style={{ width: 18, height: 18, objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: 16 }}>🧩</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#d4d8e8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {comp.config?.description || comp.description ? (
          <span
            style={{
              fontSize: 11,
              color: '#5b6080',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {comp.config?.description ?? comp.description}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#4b5270',
        marginBottom: 8,
        marginTop: 16,
        paddingLeft: 4,
        fontWeight: 600,
      }}
    >
      {label}
    </p>
  )
}

// Map component names to categories
function getCategory(name: string, comp: any): string {
  // Check if component.json has a category field
  const cat = comp.config?.category ?? comp.category
  if (cat) return cat

  // Fallback: infer from name
  const lower = name.toLowerCase()
  if (lower.includes('button') || lower.includes('btn')) return 'Buttons'
  if (lower.includes('card'))   return 'Cards'
  if (lower.includes('icon'))   return 'Icons'
  if (lower.includes('input') || lower.includes('field') || lower.includes('form')) return 'Inputs'
  if (lower.includes('text')  || lower.includes('heading') || lower.includes('label')) return 'Typography'
  if (lower.includes('image') || lower.includes('img') || lower.includes('avatar')) return 'Media'
  return 'Components'
}

export function Sidebar({ loader }: any) {
  const manifest = loader.getManifest()
  const components = Object.entries(manifest?.components ?? {})

  // Group components by category
  const grouped = components.reduce<Record<string, [string, any][]>>(
    (acc, [name, comp]: any) => {
      const cat = getCategory(name, comp)
      if (!acc[cat]) acc[cat] = []
      acc[cat].push([name, comp])
      return acc
    },
    {}
  )

  // Sort categories alphabetically, but put 'Components' last
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === 'Components') return 1
    if (b === 'Components') return -1
    return a.localeCompare(b)
  })

  return (
    <div
      style={{
        minWidth: 220,
        width: 220,
        height: '100%',
        borderRight: '1px solid #1e2030',
        background: '#161824',
        padding: '14px 10px',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {sortedCategories.map((category, i) => (
        <div key={category}>
          <SectionLabel label={category} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {grouped[category].map(([name, comp]) => (
              <SidebarItem key={name} name={name} comp={comp} />
            ))}
          </div>
        </div>
      ))}

      {/* <Toolbox loader={loader} /> */}
    </div>
  )
}