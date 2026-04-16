import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { useRef } from 'react'
import { Sidebar } from './Sidebar_old'
import { Canvas } from './Canvas_old'
import { SettingsPanel } from './SettingsPanel'
import { useStore } from '../store/designerStore_old'

export function Designer({ loader }: any) {
  const addNode = useStore((s: any) => s.addNode)
  const selected = useStore((s: any) => s.selected)
  const canvasRef = useRef<HTMLDivElement>(null)

  function handleDragEnd(event: DragEndEvent) {
  const { active, over, delta } = event
  if (!over) return

  if (over.id === 'canvas') {
    const type = active.data.current?.type
    if (!type) return

    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const canvasWidth = canvasRect?.width ?? 800
    const canvasHeight = canvasRect?.height ?? 600

    // Random small offset so multiple drops don't stack exactly
    const jitter = () => Math.floor(Math.random() * 40) - 20

    const x = Math.min(
      Math.max(0, canvasWidth / 4 + delta.x + jitter()),
      canvasWidth - 160
    )
    const y = Math.min(
      Math.max(0, canvasHeight / 4 + delta.y + jitter()),
      canvasHeight - 100
    )

    addNode({
      id: crypto.randomUUID(),
      type,
      props: {},
      x,
      y,
    })
  }
}

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',   // ← prevents any child from expanding the page
        background: '#000000',
      }}>
        <Sidebar loader={loader} />

        <div
          ref={canvasRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',  // ← clips canvas items that go out of bounds
            minWidth: 0,         // ← prevents flex child from overflowing
          }}
        >
          <Canvas loader={loader} />
        </div>

        {selected && <SettingsPanel loader={loader} />}
      </div>
    </DndContext>
  )
}