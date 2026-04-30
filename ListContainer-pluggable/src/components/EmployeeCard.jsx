const DEPT_THEME = {
  Design:      { bg: "#fce7f3", color: "#9d174d" },
  Engineering: { bg: "#dbeafe", color: "#1e40af" },
  Marketing:   { bg: "#dcfce7", color: "#166534" },
  Finance:     { bg: "#fef9c3", color: "#854d0e" },
  HR:          { bg: "#ede9fe", color: "#5b21b6" },
  Sales:       { bg: "#ffedd5", color: "#9a3412" },
  Product:     { bg: "#f0fdf4", color: "#14532d" },
  Legal:       { bg: "#f1f5f9", color: "#334155" },
};

const STATUS_COLOR = {
  active:  "#22c55e",
  away:    "#f59e0b",
  offline: "#d1d5db",
};

const AVATAR_PALETTE = [
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#dcfce7", color: "#166534" },
  { bg: "#fef9c3", color: "#854d0e" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#ffedd5", color: "#9a3412" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColors(name) {
  const idx = name.charCodeAt(0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

/**
 * EmployeeCard
 *
 * Props:
 *  - id         : string
 *  - name       : string
 *  - age        : number
 *  - role       : string   (e.g. "Product Designer")
 *  - department : string   (e.g. "Design")
 *  - experience : string   (e.g. "3 yrs")
 *  - status     : "active" | "away" | "offline"
 */
export function EmployeeCard({ id, name, age, role, department, experience, status = "active" }) {
  const initials = getInitials(name);
  const avatarColors = getAvatarColors(name);
  const deptTheme = DEPT_THEME[department] ?? { bg: "#f1f5f9", color: "#334155" };

  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-purple-50 last:border-b-0 gap-3">
      {/* Left — avatar + name + meta */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
          style={{ background: avatarColors.bg, color: avatarColors.color }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-purple-900 truncate">{name}</p>
          <p className="text-[10px] text-purple-400 mt-0.5 truncate">
            Age {age} · {role}
          </p>
        </div>
      </div>

      {/* Right — dept badge + experience + status dot */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: deptTheme.bg, color: deptTheme.color }}
        >
          {department}
        </span>
        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md">
          {experience}
        </span>
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: STATUS_COLOR[status] }}
          title={status}
        />
      </div>
    </div>
  );
}