/**
 * Designer.tsx
 */

import { useRef } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Canvas }           from './Canvas'
import { ComponentSidebar } from './Sidebar'
import { PropertiesPanel }  from './PropertiesPanel'
import { useStore }         from '../store/designerStore'

interface DesignerProps {
  loader: {
    getComponent: (type: string) => any
    getMeta:      (type: string) => any
    getAllMeta:    () => any[]
  }
}

export function Designer({ loader }: DesignerProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const addNode   = useStore((s) => s.addNode)
  const moveNode  = useStore((s) => s.moveNode)
  const select    = useStore((s) => s.select)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event

    // ── Case 1: preset tile dropped from sidebar onto canvas ──────────────
    if (
      over?.id === 'canvas' &&
      typeof active.id === 'string' &&
      active.id.startsWith('preset::')
    ) {
      const { componentType, preset } = active.data.current as {
        componentType: string
        preset: {
          defaultProps:   Record<string, any>
          defaultActions?: Record<string, any>
        }
      }

      const canvasRect  = canvasRef.current?.getBoundingClientRect()
      const pointerEvent = event.activatorEvent as PointerEvent

      const startX = pointerEvent.clientX - (canvasRect?.left ?? 0)
      const startY = pointerEvent.clientY - (canvasRect?.top  ?? 0)

      const x = Math.max(0, startX + delta.x - 60)
      const y = Math.max(0, startY + delta.y - 40)

      // addNode deep-clones preset.defaultProps internally,
      // so binding strings like "{{activeProjects}}" are preserved.
      addNode(componentType, preset, { x, y })
      return
    }

    // ── Case 2: existing canvas node repositioned ─────────────────────────
    if (over?.id === 'canvas') {
      const nodeId = active.id as string
      const store  = useStore.getState()
      const page   = store.pages.find((p) => p.id === store.currentPageId)
      const node   = page?.nodes.find((n) => n.id === nodeId)
      if (!node) return
      moveNode(nodeId, node.x + delta.x, node.y + delta.y)
    }
  }

  function onDragStart() {
    select(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div style={{
        display:    'flex',
        width:      '100vw',
        height:     '100vh',
        overflow:   'hidden',
        background: '#0d0e17',
      }}>
        <ComponentSidebar loader={loader} />

        <div ref={canvasRef} style={{ flex: 1, position: 'relative' }}>
          <Canvas loader={loader} />
        </div>

        <PropertiesPanel loader={loader} />
      </div>
    </DndContext>
  )
}