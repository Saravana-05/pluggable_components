import { useState } from "react";
import { useDrag } from "../context/DragContext";

const THEME = {
  campaigns: {
    header: "bg-blue-50 border-blue-200",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-800",
    dropAccept: "bg-blue-50 border-blue-400 text-blue-600",
    dropIdle: "border-blue-200 text-blue-300",
    footer: "border-blue-100",
    count: "text-blue-400",
    title: "text-blue-900",
    clearBtn: "text-blue-500 hover:bg-blue-100",
    submitBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    previewBg: "bg-blue-50/60",
    previewBorder: "border-blue-100",
  },
  tasks: {
    header: "bg-emerald-50 border-emerald-200",
    border: "border-emerald-300",
    badge: "bg-emerald-100 text-emerald-800",
    dropAccept: "bg-emerald-50 border-emerald-400 text-emerald-600",
    dropIdle: "border-emerald-200 text-emerald-300",
    footer: "border-emerald-100",
    count: "text-emerald-400",
    title: "text-emerald-900",
    clearBtn: "text-emerald-500 hover:bg-emerald-100",
    submitBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    previewBg: "bg-emerald-50/60",
    previewBorder: "border-emerald-100",
  },
  employees: {
    header: "bg-purple-50 border-purple-200",
    border: "border-purple-300",
    badge: "bg-purple-100 text-purple-800",
    dropAccept: "bg-purple-50 border-purple-400 text-purple-600",
    dropIdle: "border-purple-200 text-purple-300",
    footer: "border-purple-100",
    count: "text-purple-400",
    title: "text-purple-900",
    clearBtn: "text-purple-500 hover:bg-purple-100",
    submitBtn: "bg-purple-600 hover:bg-purple-700 text-white",
    previewBg: "bg-purple-50/60",
    previewBorder: "border-purple-100",
  },
  default: {
    header: "bg-violet-50 border-violet-200",
    border: "border-violet-300",
    badge: "",
    dropAccept: "bg-violet-50 border-violet-400 text-violet-600",
    dropIdle: "border-violet-200 text-violet-300",
    footer: "border-violet-100",
    count: "text-violet-400",
    title: "text-violet-900",
    clearBtn: "text-violet-500 hover:bg-violet-100",
    submitBtn: "bg-violet-600 hover:bg-violet-700 text-white",
    previewBg: "bg-violet-50/60",
    previewBorder: "border-violet-100",
  },
};

const LABEL = {
  campaigns: "Active Campaigns",
  tasks: "Upcoming Tasks",
  employees: "Employee List",
};

// ── Placeholder cards (shown in preview/pending state) ────────────────────────

function CampaignPlaceholder() {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-blue-100 last:border-b-0 gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-blue-300 truncate italic">Campaign Name</p>
        <p className="text-[10px] text-blue-200 mt-0.5 truncate italic">Company</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-20 h-[5px] bg-blue-100 rounded-full overflow-hidden">
          <div className="h-full w-2/5 bg-blue-200 rounded-full" />
        </div>
        <span className="text-[10px] font-medium text-blue-200 w-7 text-right">--%</span>
      </div>
    </div>
  );
}

function TaskPlaceholder() {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-emerald-100 last:border-b-0 gap-3">
      <div className="flex items-start gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-[3px] bg-emerald-200" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-emerald-300 truncate italic">Task Description</p>
          <p className="text-[10px] text-emerald-200 mt-0.5 italic">Assignee</p>
        </div>
      </div>
      <div className="text-[10px] text-emerald-200 flex-shrink-0">--/--</div>
    </div>
  );
}

function EmployeePlaceholder() {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-purple-100 last:border-b-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-purple-100 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-purple-300 truncate italic">Employee Name</p>
          <p className="text-[10px] text-purple-200 mt-0.5 italic">Age · Role</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-200">Dept</span>
        <span className="text-[10px] bg-purple-50 text-purple-200 px-1.5 py-0.5 rounded-md">-- yrs</span>
        <span className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
      </div>
    </div>
  );
}

const PLACEHOLDERS = {
  campaigns: CampaignPlaceholder,
  tasks: TaskPlaceholder,
  employees: EmployeePlaceholder,
};

/**
 * ListContainer
 *
 * State machine per container:
 *   "empty"   — no card type dropped yet, shows drop zone
 *   "preview" — card type dropped, shows 1 placeholder + Submit button
 *   "loaded"  — Submit clicked, shows all real data
 *
 * Props:
 *  - id         : string
 *  - lockedType : string | null
 *  - items      : array  (real data, populated after submit)
 *  - onDrop     : (containerId, cardType) => void
 *  - onClear    : (containerId) => void
 *  - onSubmit   : (containerId) => void   ← NEW
 *  - renderItem : (type, item) => ReactNode
 *  - submitted  : boolean                 ← NEW
 */
export function ListContainer({
  id,
  lockedType,
  items,
  onDrop,
  onClear,
  onSubmit,
  renderItem,
  submitted,
}) {
  const { dragPayload } = useDrag();
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState("");

  const theme = THEME[lockedType] ?? THEME.default;

  const isDraggingCard = dragPayload && dragPayload.type !== "container";
  const wouldReject = isDraggingCard && lockedType && lockedType !== dragPayload?.type;
  const wouldAccept = isDraggingCard && !wouldReject;

  // Derived state
  const isPending = lockedType && !submitted; // type chosen but not yet submitted
  const isLoaded = lockedType && submitted;   // real data showing

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  const handleDragOver = (e) => {
    if (!isDraggingCard) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    if (!dragPayload || dragPayload.type === "container") return;
    if (lockedType && lockedType !== dragPayload.type) {
      showError(`Locked to "${LABEL[lockedType]}". Clear first.`);
      return;
    }
    // Only allow drop if not yet submitted
    if (submitted) {
      showError("Already submitted. Clear to start over.");
      return;
    }
    onDrop(id, dragPayload.type);
  };

  const dropZoneClass = `
    rounded-lg border-[1.5px] border-dashed text-center text-[11px] transition-colors py-4
    ${isOver && wouldAccept ? theme.dropAccept : ""}
    ${isOver && wouldReject ? "bg-rose-50 border-rose-300 text-rose-400" : ""}
    ${!isOver ? theme.dropIdle : ""}
  `;

  const PlaceholderCard = lockedType ? PLACEHOLDERS[lockedType] : null;

  return (
    <div
      className={`w-64 rounded-xl border-[1.5px] bg-white overflow-hidden flex-shrink-0 transition-colors ${theme.border}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3.5 py-2.5 border-b ${theme.header}`}>
        <span className={`text-xs font-medium ${theme.title}`}>
          {lockedType ? LABEL[lockedType] : "List Container"}
        </span>
        <div className="flex items-center gap-1.5">
          {lockedType && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${theme.badge}`}>
              {LABEL[lockedType]}
            </span>
          )}
          {lockedType && (
            <button
              onClick={() => onClear(id)}
              className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${theme.clearBtn}`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="mx-3 mt-2 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[10px]">
          {error}
        </div>
      )}

      {/* Body */}
      <div>
        {/* EMPTY — no type dropped yet */}
        {!lockedType && (
          <div className={`m-3 ${dropZoneClass}`}>
            {isOver && wouldReject ? "Different type — rejected" : "Drop a card here"}
          </div>
        )}

        {/* PENDING — type chosen, show 1 placeholder */}
        {isPending && PlaceholderCard && (
          <div className={`${theme.previewBg}`}>
            <div className="px-3.5 pt-2.5 pb-1">
              <p className={`text-[10px] font-medium ${theme.count} uppercase tracking-wide`}>
                Preview
              </p>
            </div>
            <PlaceholderCard />
            <div className={`border-t ${theme.previewBorder} mx-3 my-2 pt-2 pb-1`}>
              <p className="text-[10px] text-slate-400 text-center mb-2">
                Click Submit to load all data
              </p>
              <button
                onClick={() => onSubmit(id)}
                className={`w-full text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${theme.submitBtn}`}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* LOADED — show all real items */}
        {isLoaded && items.length > 0 && (
          <>
            {items.map((item) => renderItem(lockedType, item))}
          </>
        )}
      </div>

      {/* Footer — only when loaded */}
      {isLoaded && items.length > 0 && (
        <div className={`flex items-center justify-between px-3.5 py-2 border-t ${theme.footer}`}>
          <span className={`text-[10px] ${theme.count}`}>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          <button className="text-[10px] text-orange-400 hover:text-orange-500 transition-colors">
            View all →
          </button>
        </div>
      )}
    </div>
  );
}