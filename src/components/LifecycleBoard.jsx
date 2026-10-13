import { useState } from "react";
import { INK, PAPER, LINE, MUTED, MONEY, MONEY_BG, SIGNAL, SIGNAL_BG, DANGER, DANGER_BG } from "../constants.js";

const LIFECYCLE_PHASES = [
  { id: "validate", label: "Validate",  icon: "🔍", color: "#0C8599", bg: "#E3FAFC",
    tasks: ["Confirm product exists on Gumroad/Etsy with active sales","Check pricing vs competitor","Map 3 competitor weaknesses to exploit","Get 10 people to say they'd pay","Verify you can legally sell this"] },
  { id: "build",    label: "Build",     icon: "🔨", color: "#6741D9", bg: "#F3F0FF",
    tasks: ["Set up selling platform (Gumroad / Etsy / Shopify)","Create v1 of the product","Write product listing copy","Set up payment processing","Test the purchase flow end to end"] },
  { id: "launch",   label: "Launch",    icon: "🚀", color: "#E67700", bg: "#FFF3BF",
    tasks: ["Post launch announcement in 3 communities","DM 20 warm contacts","Run first ad ($5/day test)","Collect first 3 testimonials","Fix #1 customer complaint"] },
  { id: "scale",    label: "Scale",     icon: "📈", color: MONEY,     bg: MONEY_BG,
    tasks: ["Double budget on winning ad channel","Launch referral/affiliate program","Add upsell or bundle","Reach $5K MRR milestone","Document repeatable acquisition process"] },
];

const HEALTH = {
  green:  { label: "On track",  color: MONEY,  bg: MONEY_BG,  dot: "#22c55e" },
  yellow: { label: "At risk",   color: SIGNAL, bg: SIGNAL_BG, dot: "#f59e0b" },
  red:    { label: "Off track", color: DANGER, bg: DANGER_BG, dot: "#ef4444" },
};

function computeHealth(product) {
  const weeks = product.weeklyRevenue || [];
  if (weeks.length < 2) return "green";
  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const target = last.target || 0;
  const actual = last.actual || 0;
  if (!target) return "green";
  const ratio = actual / target;
  if (ratio >= 0.8) return "green";
  if (ratio >= 0.5) return "yellow";
  const prevRatio = prev.target ? (prev.actual || 0) / prev.target : 1;
  if (ratio < 0.5 && prevRatio < 0.5) return "red";
  return "yellow";
}

function Dot({ color, size = 8 }) {
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

function PhaseBar({ phase }) {
  const idx = LIFECYCLE_PHASES.findIndex(p => p.id === phase);
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {LIFECYCLE_PHASES.map((p, i) => (
        <div key={p.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: i <= idx ? p.color : LINE }} />
          <span style={{ fontSize: 9, color: i === idx ? p.color : MUTED, fontWeight: i === idx ? 700 : 400, textTransform: "uppercase", letterSpacing: ".05em" }}>
            {p.icon} {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProductDetail({ product, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [weekInput, setWeekInput] = useState({ week: "", actual: "", note: "" });
  const [channelInput, setChannelInput] = useState({ name: "", status: "active" });
  const [noteInput, setNoteInput] = useState(product.notes || "");

  const phase = LIFECYCLE_PHASES.find(p => p.id === product.phase) || LIFECYCLE_PHASES[0];
  const health = computeHealth(product);
  const h = HEALTH[health];

  const totalRevenue = (product.weeklyRevenue || []).reduce((s, w) => s + (Number(w.actual) || 0), 0);
  const latestWeek = (product.weeklyRevenue || []).slice(-1)[0];
  const currentWeekRevenue = latestWeek?.actual || 0;
  const currentWeekTarget = latestWeek?.target || 0;
  const tasksDone = (product.tasks || []).filter(t => t.done).length;
  const tasksTotal = (product.tasks || []).length;

  const logRevenue = () => {
    if (!weekInput.week || weekInput.actual === "") return;
    const target = getWeekTarget(product, Number(weekInput.week));
    const entry = { week: Number(weekInput.week), actual: Number(weekInput.actual), target, note: weekInput.note, date: new Date().toLocaleDateString() };
    const existing = (product.weeklyRevenue || []).filter(w => w.week !== entry.week);
    onUpdate({ weeklyRevenue: [...existing, entry].sort((a, b) => a.week - b.week) });
    setWeekInput({ week: "", actual: "", note: "" });
  };

  const addChannel = () => {
    if (!channelInput.name) return;
    onUpdate({ channels: [...(product.channels || []), { ...channelInput, id: Date.now() }] });
    setChannelInput({ name: "", status: "active" });
  };

  const toggleTask = (taskId) => {
    const tasks = (product.tasks || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    onUpdate({ tasks });
  };

  const advancePhase = () => {
    const idx = LIFECYCLE_PHASES.findIndex(p => p.id === product.phase);
    if (idx < LIFECYCLE_PHASES.length - 1) {
      const next = LIFECYCLE_PHASES[idx + 1];
      const existingIds = new Set((product.tasks || []).map(t => t.id));
      const newTasks = next.tasks.filter(t => !existingIds.has(next.id + "_" + t)).map(t => ({ id: next.id + "_" + t.slice(0, 20), label: t, done: false, phase: next.id }));
      onUpdate({ phase: next.id, tasks: [...(product.tasks || []), ...newTasks] });
    }
  };

  const phaseIdx = LIFECYCLE_PHASES.findIndex(p => p.id === product.phase);
  const canAdvance = phaseIdx < LIFECYCLE_PHASES.length - 1;
  const TABS = ["overview", "revenue", "tasks", "channels", "notes"];

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${LINE}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Active product</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{product.niche}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ padding: "2px 8px", borderRadius: 10, background: h.bg, color: h.color, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Dot color={h.dot} /> {h.label}
              </span>
              <span style={{ fontSize: 11, color: MUTED }}>Score {product.score}/100 · Added {product.addedDate}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {canAdvance && (
              <button onClick={advancePhase} style={{ padding: "7px 14px", borderRadius: 8, background: phase.color, color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                → Advance to {LIFECYCLE_PHASES[phaseIdx + 1].label}
              </button>
            )}
            <button onClick={onClose} style={{ padding: "7px 12px", borderRadius: 8, background: "#fff", color: MUTED, border: `1px solid ${LINE}`, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back
            </button>
          </div>
        </div>
        <div style={{ marginTop: 14 }}><PhaseBar phase={product.phase} /></div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${LINE}`, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: `2px solid ${activeTab === t ? INK : "transparent"}`, color: activeTab === t ? INK : MUTED, fontWeight: activeTab === t ? 700 : 400, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "18px 20px" }}>
        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
              {[["Total Revenue","$"+totalRevenue.toLocaleString(),MONEY],["This Week","$"+Number(currentWeekRevenue).toLocaleString(),currentWeekRevenue>=currentWeekTarget?MONEY:DANGER],["Week Target","$"+Number(currentWeekTarget).toLocaleString(),MUTED],["Tasks Done",`${tasksDone}/${tasksTotal}`,tasksDone===tasksTotal&&tasksTotal>0?MONEY:INK]].map(([k,v,c]) => (
                <div key={k} style={{ padding: "12px 14px", borderRadius: 10, background: PAPER, border: `1px solid ${LINE}` }}>
                  <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: "monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>{phase.icon} {phase.label} phase — checklist</div>
              <div style={{ display: "grid", gap: 6 }}>
                {(product.tasks || []).filter(t => t.phase === product.phase).map(t => (
                  <label key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: t.done ? MONEY_BG : "#fff", border: `1px solid ${t.done ? MONEY : LINE}` }}>
                    <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t.id)} style={{ marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: t.done ? MONEY : INK, textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {health !== "green" && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: h.bg, border: `1px solid ${h.color}33` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: h.color, marginBottom: 6 }}>{health === "red" ? "⚠️ Pivot signal — action required" : "⚡ At risk — review needed"}</div>
                <div style={{ fontSize: 12, color: INK, lineHeight: 1.6 }}>{health === "red" ? "Revenue has missed target by >50% for 2+ consecutive weeks. Consider: new ad creative, price change, or run a new Revenue Engine pipeline on an adjacent niche." : "Revenue is below target. Check your top channel — is traffic dropping? Is conversion rate below 2%?"}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === "revenue" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ padding: "14px 16px", borderRadius: 10, background: PAPER, border: `1px solid ${LINE}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 10 }}>Log weekly revenue</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input placeholder="Week #" type="number" value={weekInput.week} onChange={e => setWeekInput(p => ({ ...p, week: e.target.value }))} style={{ width: 70, padding: "7px 10px", borderRadius: 7, border: `1px solid ${LINE}`, fontFamily: "inherit", fontSize: 12 }} />
                <input placeholder="Revenue $" type="number" value={weekInput.actual} onChange={e => setWeekInput(p => ({ ...p, actual: e.target.value }))} style={{ width: 110, padding: "7px 10px", borderRadius: 7, border: `1px solid ${LINE}`, fontFamily: "inherit", fontSize: 12 }} />
                <input placeholder="Note (optional)" value={weekInput.note} onChange={e => setWeekInput(p => ({ ...p, note: e.target.value }))} style={{ flex: 1, minWidth: 120, padding: "7px 10px", borderRadius: 7, border: `1px solid ${LINE}`, fontFamily: "inherit", fontSize: 12 }} />
                <button onClick={logRevenue} style={{ padding: "7px 14px", borderRadius: 7, background: MONEY, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Log</button>
              </div>
            </div>
            {(product.weeklyRevenue || []).length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ borderBottom: `1px solid ${LINE}` }}>{["Week","Actual","Target","vs Target","Note"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: MUTED, fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                  <tbody>{[...(product.weeklyRevenue||[])].reverse().map((w,i) => { const delta=w.target?Math.round(((w.actual-w.target)/w.target)*100):null; return <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}><td style={{ padding:"9px 10px",fontWeight:700 }}>W{w.week}</td><td style={{ padding:"9px 10px",fontFamily:"monospace",fontWeight:700,color:MONEY }}>${Number(w.actual).toLocaleString()}</td><td style={{ padding:"9px 10px",fontFamily:"monospace",color:MUTED }}>${Number(w.target||0).toLocaleString()}</td><td style={{ padding:"9px 10px" }}>{delta!==null&&<span style={{ color:delta>=0?MONEY:DANGER,fontWeight:700 }}>{delta>=0?"+":""}{delta}%</span>}</td><td style={{ padding:"9px 10px",color:MUTED }}>{w.note}</td></tr>; })}</tbody>
                </table>
              </div>
            ) : <div style={{ padding:20,textAlign:"center",color:MUTED,fontSize:13 }}>No revenue logged yet.</div>}
          </div>
        )}

        {activeTab === "tasks" && (
          <div style={{ display: "grid", gap: 20 }}>
            {LIFECYCLE_PHASES.map(ph => {
              const phaseTasks=(product.tasks||[]).filter(t=>t.phase===ph.id);
              if(!phaseTasks.length) return null;
              const done=phaseTasks.filter(t=>t.done).length;
              return <div key={ph.id}><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}><span style={{ fontSize:13,fontWeight:700,color:ph.color }}>{ph.icon} {ph.label}</span><span style={{ fontSize:10,color:MUTED }}>{done}/{phaseTasks.length}</span><div style={{ flex:1,height:3,borderRadius:2,background:LINE,overflow:"hidden" }}><div style={{ width:`${phaseTasks.length?(done/phaseTasks.length)*100:0}%`,height:"100%",background:ph.color,borderRadius:2 }} /></div></div><div style={{ display:"grid",gap:5 }}>{phaseTasks.map(t=><label key={t.id} style={{ display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"9px 12px",borderRadius:8,background:t.done?MONEY_BG:"#fff",border:`1px solid ${t.done?MONEY:LINE}` }}><input type="checkbox" checked={!!t.done} onChange={()=>toggleTask(t.id)} style={{ marginTop:2 }} /><span style={{ fontSize:13,color:t.done?MONEY:INK,textDecoration:t.done?"line-through":"none" }}>{t.label}</span></label>)}</div></div>;
            })}
          </div>
        )}

        {activeTab === "channels" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ padding:"14px 16px",borderRadius:10,background:PAPER,border:`1px solid ${LINE}` }}>
              <div style={{ fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:10 }}>Add channel</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                <input placeholder="Channel name (e.g. TikTok Ads)" value={channelInput.name} onChange={e=>setChannelInput(p=>({...p,name:e.target.value}))} style={{ flex:1,minWidth:140,padding:"7px 10px",borderRadius:7,border:`1px solid ${LINE}`,fontFamily:"inherit",fontSize:12 }} />
                <select value={channelInput.status} onChange={e=>setChannelInput(p=>({...p,status:e.target.value}))} style={{ padding:"7px 10px",borderRadius:7,border:`1px solid ${LINE}`,fontFamily:"inherit",fontSize:12,background:"#fff" }}>
                  <option value="active">Active</option><option value="testing">Testing</option><option value="paused">Paused</option><option value="killed">Killed</option>
                </select>
                <button onClick={addChannel} style={{ padding:"7px 14px",borderRadius:7,background:INK,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Add</button>
              </div>
            </div>
            {(product.channels||[]).length>0 ? (
              <div style={{ display:"grid",gap:8 }}>
                {(product.channels||[]).map((ch,i)=>{const STATUS={active:{color:MONEY,bg:MONEY_BG,label:"Active"},testing:{color:SIGNAL,bg:SIGNAL_BG,label:"Testing"},paused:{color:MUTED,bg:LINE,label:"Paused"},killed:{color:DANGER,bg:DANGER_BG,label:"Killed"}};const s=STATUS[ch.status]||STATUS.active;return <div key={ch.id||i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,background:"#fff",border:`1px solid ${LINE}` }}><Dot color={s.color} /><span style={{ flex:1,fontSize:13,fontWeight:600,color:INK }}>{ch.name}</span><select value={ch.status} onChange={e=>{const updated=(product.channels||[]).map((c,j)=>j===i?{...c,status:e.target.value}:c);onUpdate({channels:updated});}} style={{ padding:"4px 8px",borderRadius:6,border:`1px solid ${LINE}`,fontSize:11,fontFamily:"inherit",background:s.bg,color:s.color,fontWeight:700 }}><option value="active">Active</option><option value="testing">Testing</option><option value="paused">Paused</option><option value="killed">Killed</option></select></div>;})}</div>
            ) : <div style={{ padding:20,textAlign:"center",color:MUTED,fontSize:13 }}>No channels tracked yet.</div>}
          </div>
        )}

        {activeTab === "notes" && (
          <textarea value={noteInput} onChange={e=>{setNoteInput(e.target.value);onUpdate({notes:e.target.value});}} placeholder="Strategy notes, decisions, what's working, what to try next..." style={{ width:"100%",minHeight:220,padding:"12px 14px",borderRadius:9,border:`1px solid ${LINE}`,fontFamily:"inherit",fontSize:13,lineHeight:1.7,color:INK,background:"#fff",resize:"vertical",boxSizing:"border-box" }} />
        )}
      </div>
    </div>
  );
}

function getWeekTarget(product, week) {
  if (week <= 4) return 0;
  if (week <= 8) return 500;
  if (week <= 12) return 2000;
  return 5000;
}

function PortfolioCard({ product, onSelect, onRemove }) {
  const phase = LIFECYCLE_PHASES.find(p => p.id === product.phase) || LIFECYCLE_PHASES[0];
  const health = computeHealth(product);
  const h = HEALTH[health];
  const totalRevenue = (product.weeklyRevenue || []).reduce((s, w) => s + (Number(w.actual) || 0), 0);
  const tasksDone = (product.tasks || []).filter(t => t.done).length;
  const tasksTotal = (product.tasks || []).length;
  const pct = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.niche}</div>
          <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Score {product.score}/100 · {product.addedDate}</div>
        </div>
        <span style={{ padding: "3px 9px", borderRadius: 10, background: h.bg, color: h.color, fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <Dot color={h.dot} size={6} />{h.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: phase.color, background: phase.bg, padding: "2px 8px", borderRadius: 8 }}>{phase.icon} {phase.label}</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div><div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase" }}>Revenue</div><div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: MONEY }}>${totalRevenue.toLocaleString()}</div></div>
        <div><div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase" }}>Tasks</div><div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: INK }}>{tasksDone}/{tasksTotal}</div></div>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: phase.color, borderRadius: 2, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onSelect} style={{ flex: 1, padding: "7px", borderRadius: 7, background: INK, color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Open →</button>
        <button onClick={onRemove} style={{ padding: "7px 10px", borderRadius: 7, background: "#fff", color: MUTED, border: `1px solid ${LINE}`, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
      </div>
    </div>
  );
}

export function LifecycleBoard({ products, onUpdate, onRemove, setTab }) {
  const [selected, setSelected] = useState(null);

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", color: MUTED }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 6 }}>No managed products yet</div>
        <div style={{ fontSize: 13, maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>Run a pipeline, then click <strong>"+ Manage"</strong> on any result to add it to your portfolio and start tracking its lifecycle.</div>
        <button onClick={() => setTab("agents")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 8, background: INK, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Run a pipeline →</button>
      </div>
    );
  }

  if (selected) {
    const product = products.find(p => p.id === selected);
    if (!product) { setSelected(null); return null; }
    return <ProductDetail product={product} onUpdate={(updates) => onUpdate(selected, updates)} onClose={() => setSelected(null)} />;
  }

  const totalRevenue = products.reduce((s, p) => s + (p.weeklyRevenue || []).reduce((a, w) => a + (Number(w.actual) || 0), 0), 0);
  const activeCount = products.filter(p => ["launch", "scale"].includes(p.phase)).length;
  const redCount = products.filter(p => computeHealth(p) === "red").length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 }}>
        {[["Products",products.length,INK],["Active",activeCount,MONEY],["Total Revenue","$"+totalRevenue.toLocaleString(),MONEY],["Need Attention",redCount,redCount>0?DANGER:MUTED]].map(([k,v,c]) => (
          <div key={k} style={{ padding: "10px 12px", borderRadius: 10, background: "#fff", border: `1px solid ${LINE}` }}>
            <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {products.map(p => <PortfolioCard key={p.id} product={p} onSelect={() => setSelected(p.id)} onRemove={() => onRemove(p.id)} />)}
      </div>
    </div>
  );
}
