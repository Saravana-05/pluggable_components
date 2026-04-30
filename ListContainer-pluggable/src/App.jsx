import { useState } from "react";
import { DragProvider } from "./context/DragContext";
import { Sidebar } from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import { ActiveCampaignsCard } from "./components/ActiveCampaignsCard";
import { UpcomingTasksCard } from "./components/UpcomingTasksCard";
import { EmployeeCard } from "./components/EmployeeCard";

// ── Data pools ─────────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  { id: "c1", name: "Q1 Product Launch", company: "TechBridge AI", percent: 76 },
  { id: "c2", name: "Thought Leadership Series", company: "FinTech Solutions Ltd", percent: 47 },
  { id: "c3", name: "Sustainability Report PR", company: "GreenLeaf Organics", percent: 40 },
  { id: "c4", name: "Series B Announcement", company: "CloudStack Systems", percent: 87 },
];

const TASKS = [
  { id: "t1", name: "Draft press release for TechBridge AI launch", person: "Sarah Chen", date: "13/03", priority: "high" },
  { id: "t2", name: "Follow up with Financial Times journalist", person: "Tom Richards", date: "12/03", priority: "high" },
  { id: "t3", name: "Prepare GreenLeaf media kit", person: "Emma Wilson", date: "15/03", priority: "medium" },
  { id: "t4", name: "Monthly report for CloudStack Systems", person: "James Park", date: "14/03", priority: "medium" },
  // { id: "t5", name: "Finalise Series B coverage report", person: "Sarah Chen", date: "10/03", priority: "high" },
  // { id: "t6", name: "Review sustainability report draft", person: "Emma Wilson", date: "09/03", priority: "medium" },
  // { id: "t7", name: "Schedule CEO media training", person: "Tom Richards", date: "20/03", priority: "low" },
];

const EMPLOYEES = [
  { id: "e1", name: "Ananya Kumar",  age: 28, role: "Product Designer",  department: "Design",      experience: "3 yrs",  status: "active"  },
  { id: "e2", name: "Marcus Reid",   age: 34, role: "Engineering Lead",  department: "Engineering", experience: "7 yrs",  status: "active"  },
  { id: "e3", name: "Sofia Patel",   age: 26, role: "Marketing Exec",    department: "Marketing",   experience: "1 yr",   status: "away"    },
  { id: "e4", name: "James Liu",     age: 41, role: "Finance Director",  department: "Finance",     experience: "12 yrs", status: "offline" },
  // { id: "e5", name: "Priya Sharma",  age: 31, role: "HR Manager",        department: "HR",          experience: "5 yrs",  status: "active"  },
  // { id: "e6", name: "Daniel Brooks", age: 29, role: "Sales Executive",   department: "Sales",       experience: "2 yrs",  status: "away"    },
  // { id: "e7", name: "Lena Fischer",  age: 36, role: "Product Manager",   department: "Product",     experience: "8 yrs",  status: "active"  },
  // { id: "e8", name: "Omar Hassan",   age: 44, role: "Legal Counsel",     department: "Legal",       experience: "15 yrs", status: "offline" },
];

const DATA_POOL = { campaigns: CAMPAIGNS, tasks: TASKS, employees: EMPLOYEES };

// ── Render helpers ─────────────────────────────────────────────────────────────
function renderItem(type, item) {
  if (type === "campaigns") {
    return (
      <ActiveCampaignsCard
        key={item.id}
        name={item.name}
        company={item.company}
        percent={item.percent}
      />
    );
  }
  if (type === "tasks") {
    return (
      <UpcomingTasksCard
        key={item.id}
        name={item.name}
        person={item.person}
        date={item.date}
        priority={item.priority}
      />
    );
  }
  if (type === "employees") {
    return (
      <EmployeeCard
        key={item.id}
        id={item.id}
        name={item.name}
        age={item.age}
        role={item.role}
        department={item.department}
        experience={item.experience}
        status={item.status}
      />
    );
  }
  return null;
}

// ── App ────────────────────────────────────────────────────────────────────────
let nextContainerId = 1;

export default function App() {
  /**
   * containers: Array<{
   *   id         : string,
   *   lockedType : string | null,
   *   items      : array,         — populated only after submit
   *   submitted  : boolean,       — NEW: tracks if Submit was clicked
   * }>
   */
  const [containers, setContainers] = useState([]);

  const addContainer = () => {
    const id = `lc-${nextContainerId++}`;
    setContainers((prev) => [
      ...prev,
      { id, lockedType: null, items: [], submitted: false },
    ]);
  };

  // Called when a card type is dragged onto an empty/unlocked container.
  // Just locks the type — does NOT load data yet.
  const handleCardDrop = (containerId, cardType) => {
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id !== containerId) return c;
        if (c.lockedType && c.lockedType !== cardType) return c;
        if (c.submitted) return c; // already submitted, ignore
        return {
          ...c,
          lockedType: c.lockedType ?? cardType,
          // items stay empty until Submit
        };
      })
    );
  };

  // Called when Submit button is clicked — loads all data for that type.
  const handleSubmit = (containerId) => {
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id !== containerId) return c;
        if (!c.lockedType || c.submitted) return c;
        const allItems = DATA_POOL[c.lockedType] ?? [];
        return {
          ...c,
          items: allItems,
          submitted: true,
        };
      })
    );
  };

  // Reset a container back to empty.
  const handleClear = (containerId) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerId
          ? { ...c, lockedType: null, items: [], submitted: false }
          : c
      )
    );
  };

  return (
    <DragProvider>
      <div className="min-h-screen bg-slate-100 flex items-start justify-center p-6">
        <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <Sidebar containers={containers} />
          <Canvas
            containers={containers}
            onAddContainer={addContainer}
            onCardDrop={handleCardDrop}
            onSubmit={handleSubmit}
            onClear={handleClear}
            renderItem={renderItem}
          />
        </div>
      </div>
    </DragProvider>
  );
}