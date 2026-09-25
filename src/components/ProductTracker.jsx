// ── ProductTracker component ─────────────────────────────────
import { useState } from "react";
import { LINE, MONEY, MONEY_BG, SIGNAL, SIGNAL_BG, MUTED, DANGER, DANGER_BG, INK } from "../constants.js";

const T = (v) => (v === null || v === undefined) ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v));

// ── ProductTracker: extracted to honour Rules of Hooks ────────────────────────
export function ProductTracker({ session, td, trackerData, activeTrackerId, setTrackerData, saveTrackerData, buildTasksFromSession, loadSession, setTab, isMobile }) {
  const tasks = td?.tasks || buildTasksFromSession(session);
  const revenue = td?.revenue || [];
  const totalRevenue = revenue.reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const [revenueInput, setRevenueInput] = useState({ amount: "", note: "" });
  const [newTaskInput, setNewTaskInput] = useState({ title: "", category: "build" });
  const [expandedTask, setExpandedTask] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const updateTask = (taskId, updates) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    const newTd = { ...trackerData, [activeTrackerId]: { ...td, tasks: newTasks } };
    setTrackerData(newTd);
    saveTrackerData(newTd);
  };

  const addRevenue = (amount, note) => {
    const newRevenue = [...revenue, { amount, note, date: new Date().toLocaleDateString() }];
    const newTd = { ...trackerData, [activeTrackerId]: { ...td, revenue: newRevenue } };
    setTrackerData(newTd);
    saveTrackerData(newTd);
  };

  const updateNotes = (field, value) => {
    const newTd = { ...trackerData, [activeTrackerId]: { ...td, [field]: value } };
    setTrackerData(newTd);
    saveTrackerData(newTd);
  };

  const categories = [
    { id: "validation", label: "✅ Validation", color: "#0C8599", bg: "#E3FAFC" },
    { id: "build",      label: "🔨 Build",      color: "#6741D9", bg: "#F3F0FF" },
    { id: "marketing",  label: "📣 Marketing",  color: "#E67700", bg: "#FFF3BF" },
    { id: "growth",     label: "📈 Growth",     color: "#2F9E44", bg: "#EBFBEE" },
  ];

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const pct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const blockedTasks = tasks.filter(t => t.status === "blocked").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;

  const statusColors = {
    "todo":        { bg: "#F9F8F5", color: MUTED,   label: "To do" },
    "in-progress": { bg: SIGNAL_BG, color: SIGNAL,  label: "In progress" },
    "blocked":     { bg: DANGER_BG, color: DANGER,  label: "Blocked" },
    "done":        { bg: MONEY_BG,  color: MONEY,   label: "Done ✓" },
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>

      {/* ── HEADER ── */}
      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Active product</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: INK }}>{session?.niche}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
              Started {session?.date} · Score {session?.nicheScore || "—"}/50 · {session?.viability || "—"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["active","🟢 Active"],["paused","🟡 Paused"],["completed","✅ Completed"],["dropped","🔴 Dropped"]].map(([v,l]) => (
              <button key={v} onClick={() => updateNotes("productStatus", v)}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${td?.productStatus===v ? INK : LINE}`, background: td?.productStatus===v ? INK : "#fff", color: td?.productStatus===v ? "#fff" : MUTED, cursor: "pointer", fontFamily: "inherit" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{pct}% complete</span>
            <span style={{ fontSize: 11, color: MUTED }}>{doneTasks}/{tasks.length} tasks · {inProgressTasks} in progress · {blockedTasks} blocked</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: LINE }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: pct >= 75 ? MONEY : pct >= 40 ? SIGNAL : "#ADB5BD", transition: "width .3s" }} />
          </div>
        </div>

        {/* Revenue */}
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ background: MONEY_BG, border: `1px solid ${MONEY}`, borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: MONEY, textTransform: "uppercase" }}>Total Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: INK }}>${totalRevenue.toLocaleString()}</div>
          </div>
          <div style={{ background: "#F9F8F5", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>Sales</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: INK }}>{revenue.length}</div>
          </div>
          <div style={{ background: "#F9F8F5", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>Avg Sale</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: INK }}>${revenue.length ? Math.round(totalRevenue / revenue.length) : 0}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input value={revenueInput.amount} onChange={e => setRevenueInput(p => ({...p, amount: e.target.value}))}
              placeholder="Amount $" type="number"
              style={{ width: 90, padding: "6px 8px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "monospace", outline: "none" }} />
            <input value={revenueInput.note} onChange={e => setRevenueInput(p => ({...p, note: e.target.value}))}
              placeholder="Note (e.g. Etsy sale)"
              style={{ width: 150, padding: "6px 8px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "inherit", outline: "none" }} />
            <button onClick={() => {
              if (!revenueInput.amount) return;
              addRevenue(revenueInput.amount, revenueInput.note);
              setRevenueInput({ amount: "", note: "" });
            }} style={{ padding: "6px 12px", background: MONEY, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              + Log Sale
            </button>
          </div>
        </div>

        {revenue.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {revenue.slice(-5).reverse().map((r, i) => (
              <span key={i} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: MONEY_BG, color: MONEY, fontWeight: 600 }}>
                ${r.amount} · {r.note || "sale"} · {r.date}
              </span>
            ))}
            {revenue.length > 5 && <span style={{ fontSize: 10, color: MUTED }}>+{revenue.length - 5} more</span>}
          </div>
        )}
      </div>

      {/* ── STRATEGY NOTES ── */}
      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: INK, marginBottom: 8 }}>🧠 Strategy notes & adjustments</div>
        <textarea value={td?.strategy || ""} onChange={e => updateNotes("strategy", e.target.value)}
          placeholder="Write your strategy notes here — what is working, what to change, pivot ideas, key learnings..."
          style={{ width: "100%", minHeight: 80, padding: "8px 10px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "inherit", outline: "none", resize: "vertical", color: INK, boxSizing: "border-box" }} />
      </div>

      {/* ── TASK LIST ── */}
      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>📋 Task list ({tasks.length})</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["all","All"],["validation","✅"],["build","🔨"],["marketing","📣"],["growth","📈"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilterCat(v)}
                style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${filterCat===v ? INK : LINE}`, background: filterCat===v ? INK : "#fff", color: filterCat===v ? "#fff" : MUTED, cursor: "pointer", fontFamily: "inherit" }}>
                {l}
              </button>
            ))}
            <div style={{ width: 1, background: LINE, margin: "0 2px" }} />
            {[["all","All"],["todo","To do"],["in-progress","In progress"],["blocked","Blocked"],["done","Done"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilterStatus(v)}
                style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${filterStatus===v ? INK : LINE}`, background: filterStatus===v ? INK : "#fff", color: filterStatus===v ? "#fff" : MUTED, cursor: "pointer", fontFamily: "inherit" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {tasks
          .filter(t => filterCat === "all" || t.category === filterCat)
          .filter(t => filterStatus === "all" || t.status === filterStatus)
          .map((task) => {
            const cat = categories.find(c => c.id === task.category) || categories[0];
            const isExpanded = expandedTask === task.id;
            const sc = statusColors[task.status] || statusColors.todo;
            return (
              <div key={task.id} style={{ borderBottom: `1px solid ${LINE}`, background: task.status === "done" ? "#FAFFF9" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer" }}
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                  <div onClick={e => { e.stopPropagation(); updateTask(task.id, { status: task.status === "done" ? "todo" : "done" }); }}
                    style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.status === "done" ? MONEY : LINE}`, background: task.status === "done" ? MONEY : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                    {task.status === "done" && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: cat.bg, color: cat.color, flexShrink: 0 }}>
                    {cat.label.split(" ")[0]}
                  </span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: task.status === "done" ? MUTED : INK, textDecoration: task.status === "done" ? "line-through" : "none" }}>
                    {T(task.title)}
                  </div>
                  {task.priority === "high" && task.status !== "done" && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: DANGER_BG, color: DANGER, fontWeight: 700, flexShrink: 0 }}>HIGH</span>
                  )}
                  {task.dueDate && <span style={{ fontSize: 10, color: MUTED, flexShrink: 0 }}>📅 {task.dueDate}</span>}
                  <select value={task.status} onChange={e => { e.stopPropagation(); updateTask(task.id, { status: e.target.value }); }}
                    onClick={e => e.stopPropagation()}
                    style={{ padding: "3px 6px", fontSize: 10, border: `1px solid ${LINE}`, borderRadius: 5, background: sc.bg, color: sc.color, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                  <span style={{ color: MUTED, fontSize: 10, flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
                {isExpanded && (
                  <div style={{ padding: "0 16px 12px 44px", borderTop: `1px solid ${LINE}` }}>
                    {task.detail && <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, marginTop: 8, lineHeight: 1.5 }}>{T(task.detail)}</div>}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, marginTop: task.detail ? 0 : 8 }}>
                      <div>
                        <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, marginBottom: 3 }}>DUE DATE</div>
                        <input type="date" value={task.dueDate || ""} onChange={e => updateTask(task.id, { dueDate: e.target.value })}
                          style={{ padding: "4px 8px", fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 5, fontFamily: "inherit", outline: "none" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, marginBottom: 3 }}>PRIORITY</div>
                        <select value={task.priority || "medium"} onChange={e => updateTask(task.id, { priority: e.target.value })}
                          style={{ padding: "4px 8px", fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 5, fontFamily: "inherit", outline: "none" }}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, marginBottom: 3 }}>NOTES</div>
                    <textarea value={task.notes || ""} onChange={e => updateTask(task.id, { notes: e.target.value })}
                      placeholder="Add notes, links, results for this task..."
                      style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 5, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 50, boxSizing: "border-box" }} />
                  </div>
                )}
              </div>
            );
          })}

        {/* Add custom task */}
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${LINE}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input value={newTaskInput.title} onChange={e => setNewTaskInput(p => ({...p, title: e.target.value}))}
            onKeyDown={e => {
              if (e.key === "Enter" && newTaskInput.title.trim()) {
                const newTask = { id: `custom-${Date.now()}`, category: newTaskInput.category, title: newTaskInput.title.trim(), detail: "", status: "todo", priority: "medium", dueDate: "", notes: "" };
                const newTasks = [...tasks, newTask];
                const newTd = { ...trackerData, [activeTrackerId]: { ...td, tasks: newTasks } };
                setTrackerData(newTd);
                saveTrackerData(newTd);
                setNewTaskInput({ title: "", category: "build" });
              }
            }}
            placeholder="Add a task and press Enter..."
            style={{ flex: 1, padding: "7px 10px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "inherit", outline: "none", minWidth: 200 }} />
          <select value={newTaskInput.category} onChange={e => setNewTaskInput(p => ({...p, category: e.target.value}))}
            style={{ padding: "7px 10px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "inherit", outline: "none" }}>
            <option value="validation">✅ Validation</option>
            <option value="build">🔨 Build</option>
            <option value="marketing">📣 Marketing</option>
            <option value="growth">📈 Growth</option>
          </select>
        </div>
      </div>

      {/* ── AGENT QUICK LINKS ── */}
      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: INK, marginBottom: 10 }}>🔗 Jump to agent research</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Validation Platforms", color: "#0C8599", bg: "#E3FAFC" },
            { label: "Copy Blueprint",       color: "#6741D9", bg: "#F3F0FF" },
            { label: "Competitor URLs",      color: "#2F9E44", bg: "#EBFBEE" },
            { label: "Marketing Copy",       color: "#E67700", bg: "#FFF3BF" },
            { label: "Copy Marketing",       color: "#C2255C", bg: "#FFF0F6" },
            { label: "French Market Fit",    color: "#1971C2", bg: "#E7F5FF" },
          ].map(({ label, color, bg }) => (
            <button key={label} onClick={() => { loadSession(session.id); setTab("agents"); }}
              style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${color}40`, background: bg, color: color, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
