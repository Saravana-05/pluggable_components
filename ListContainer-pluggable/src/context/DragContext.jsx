import { createContext, useContext, useState } from "react";

const DragContext = createContext(null);

/**
 * DragProvider
 * Shares the currently-dragged item type across the whole tree.
 * dragPayload: { type: "container" | "campaigns" | "tasks" } | null
 */
export function DragProvider({ children }) {
  const [dragPayload, setDragPayload] = useState(null);
  return (
    <DragContext.Provider value={{ dragPayload, setDragPayload }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  return useContext(DragContext);
}