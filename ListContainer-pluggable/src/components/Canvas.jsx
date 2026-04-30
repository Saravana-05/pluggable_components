import { useState } from "react";
import { useDrag } from "../context/DragContext";
import { ListContainer } from "./ListContainer";

/**
 * Canvas
 *
 * Props:
 *  - containers      : array of { id, lockedType, items, submitted }
 *  - onAddContainer  : () => void
 *  - onCardDrop      : (containerId, cardType) => void
 *  - onSubmit        : (containerId) => void   ← NEW
 *  - onClear         : (containerId) => void
 *  - renderItem      : (type, item) => ReactNode
 */
export function Canvas({ containers, onAddContainer, onCardDrop, onSubmit, onClear, renderItem }) {
  const { dragPayload } = useDrag();
  const [isOver, setIsOver] = useState(false);

  const isDraggingContainer = dragPayload?.type === "container";

  const handleDragOver = (e) => {
    if (!isDraggingContainer) return;
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    if (isDraggingContainer) onAddContainer();
  };

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex-1 rounded-r-2xl p-4 min-h-[520px] transition-colors
        ${isOver ? "bg-violet-50" : "bg-[#f8f7ff]"}
      `}
    >
      <p className="text-[10px] font-medium text-violet-400 uppercase tracking-widest mb-3">
        Canvas
      </p>

      {containers.length === 0 ? (
        <div className={`
          flex items-center justify-center h-72 rounded-xl border-[1.5px] border-dashed transition-colors
          ${isOver ? "border-violet-400 bg-violet-50 text-violet-500" : "border-violet-200 text-violet-300"}
        `}>
          <p className="text-xs text-center leading-relaxed">
            Drag "List Container"<br />here to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {containers.map((c) => (
            <ListContainer
              key={c.id}
              id={c.id}
              lockedType={c.lockedType}
              items={c.items}
              submitted={c.submitted}
              onDrop={onCardDrop}
              onSubmit={onSubmit}
              onClear={onClear}
              renderItem={renderItem}
            />
          ))}

          {/* Ghost drop zone to add more containers */}
          <div
            className={`
              w-64 h-24 rounded-xl border-[1.5px] border-dashed flex items-center justify-center transition-colors
              ${isOver ? "border-violet-400 bg-violet-50 text-violet-500" : "border-violet-200 text-violet-300"}
            `}
          >
            <p className="text-[11px]">+ drop another container</p>
          </div>
        </div>
      )}
    </main>
  );
}