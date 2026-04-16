import { useDraggable } from '@dnd-kit/core'
import { useMemo, memo } from 'react'
import { useNavigate }   from 'react-router-dom'
import { useStore }      from '../store/designerStore'

export function CanvasItem({ node, loader }: any) {
  const { setNodeRef, listeners, attributes, isDragging } =
    useDraggable({ id: node.id })

  const select   = useStore((s: any) => s.select)
  const selected = useStore((s: any) => s.selected)
  const navigate = useNavigate()

  const Comp = useMemo(() => {
    const component = loader.get(node.type)
    return component ? memo(component) : null
  }, [node.type, loader])

  const meta = useMemo(() => {
    const raw = loader.getMeta(node.type)
    return raw?.config ?? raw
  }, [node.type, loader])

  if (!Comp) return (
    <div style={{
      padding:      12,
      border:       '1px dashed #ef4444',
      color:        '#ef4444',
      fontSize:     12,
      borderRadius: 6,
      background:   'rgba(239,68,68,0.08)',
    }}>
      Unknown component: <strong>{node.type}</strong>
    </div>
  )

  const isSelected = selected === node.id

  function getAction(trigger: string) {
    if (node.actions?.[trigger]) return node.actions[trigger]
    return meta?.actions?.find((a: any) => a.trigger === trigger) ?? null
  }

  const iconClickAction = getAction('iconClick')

  function executeAction(action: any) {
    if (!action) return
    switch (action.type) {
      case 'redirect':
        action.target === '_blank'
          ? window.open(action.url, '_blank')
          : navigate(action.url)
        break
      case 'emit':
        window.dispatchEvent(new CustomEvent(action.event, { detail: { node } }))
        break
      case 'custom':
        action.handler?.(node)
        break
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position:  'absolute',
        left:      node.x,
        top:       node.y,
        opacity:   isDragging ? 0.4 : 1,
        outline:   isSelected ? '2px solid #6366f1' : '2px solid transparent',
        outlineOffset: 3,
        borderRadius:  4,
        cursor:    'grab',
        userSelect: 'none',
      }}
    >
      {/* Component — click to select; pass props straight through.
          Binding strings like "{{activeProjects}}" reach StatCard as-is,
          and StatCard's isUnresolvedBinding() guard renders them as
          dimmed italic placeholders at design time. */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          select(node.id)
        }}
      >
        <Comp {...node.props} />
      </div>

      {/* Canvas icon */}
      {meta?.ui?.canvasIcon && (
        <div
          style={{
            marginTop:     4,
            textAlign:     'center',
            pointerEvents: iconClickAction ? 'auto' : 'none',
            cursor:        iconClickAction ? 'pointer' : 'default',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            if (!iconClickAction) return
            executeAction(iconClickAction)
          }}
        >
          <img
            src={meta.ui.canvasIcon}
            alt="icon"
            style={{ width: 20, height: 20, opacity: 0.5 }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}