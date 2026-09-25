// ── Shared UI components ─────────────────────────────────────
import { useState } from "react";
import { INK, MONEY, MONEY_BG, SIGNAL, SIGNAL_BG, LINE, MUTED, DANGER, DANGER_BG } from "../constants.js";

export const T = (v) => (v === null || v === undefined) ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v));

export function ScoreCard({ label, value, good }) {
  return <div style={{textAlign:"center",padding:"8px 5px",borderRadius:6,background:good?MONEY_BG:DANGER_BG,border:`1px solid ${good?"#BFDECB":"#F0B4B4"}`}}>
    <div style={{fontSize:9,color:MUTED,fontWeight:600,textTransform:"uppercase"}}>{T(label)}</div>
    <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,marginTop:2,color:good?MONEY:DANGER}}>{T(value)}</div>
  </div>;
}

// Global CSS injected once via <GlobalStyle />. Keeps the spin keyframe (referenced
// by `animation:"spin 1s linear infinite"` everywhere), adds focus-visible outlines
// for a11y, and a few small niceties. Appended as a string for dangerouslySetInnerHTML.
const GLOBAL_STYLE = `
@keyframes spin { to { transform: rotate(360deg); } }
* { box-sizing: border-box; }
button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 2px solid #141B2E;
  outline-offset: 2px;
}
::selection { background: rgba(14,122,78,.18); }
input::placeholder { color: #9CA3AF; }
html { -webkit-text-size-adjust: 100%; }
button { -webkit-tap-highlight-color: transparent; }
`;

export function GlobalStyle() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLE }} />;
}

// ── REUSABLE PRESENTATIONAL COMPONENTS ───────────────────────────────────
// A circular SVG progress gauge for headline scores.
export function Ring({ value, max = 100, label, sublabel, color = "#0E7A4E", trackColor = "#E3E1DA", size = 92, stroke = 8, invert = false }) {
  const pct = Math.max(0, Math.min(1, (Number(value) || 0) / max));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const subColor = invert ? "rgba(255,255,255,.8)" : "#6B7280";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: size * 0.28, fontWeight: 700, color, lineHeight: 1 }}>{Math.round(Number(value) || 0)}</div>
          {sublabel && <div style={{ fontSize: 9, color: subColor, marginTop: 1 }}>{T(sublabel)}</div>}
        </div>
      </div>
      {label && <div style={{ fontSize: 10, fontWeight: 700, color: subColor, textTransform: "uppercase", letterSpacing: ".08em" }}>{T(label)}</div>}
    </div>
  );
}

// A labeled horizontal bar — sorted bar charts for dimension breakdowns.
export function BarRow({ label, value, max = 10, best, weight, color }) {
  const pct = Math.max(0, Math.min(100, ((Number(value) || 0) / max) * 100));
  const bar = color || (pct >= 70 ? "#0E7A4E" : pct >= 50 ? "#B45309" : "#C0392B");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10, color: "#141B2E", width: 132, flexShrink: 0, textTransform: "capitalize", fontWeight: 600 }}>
        {T(label).replace(/([A-Z])/g, " $1")}{weight != null && <span style={{ color: "#9CA3AF", fontWeight: 400 }}> · {T(weight)}%</span>}
      </div>
      <div style={{ flex: 1, height: 8, background: "#E3E1DA", borderRadius: 4, overflow: "hidden" }} aria-hidden="true">
        <div style={{ width: pct + "%", height: "100%", background: bar, borderRadius: 4, transition: "width .5s cubic-bezier(.2,.7,.2,1)" }} />
      </div>
      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#141B2E", width: 40, textAlign: "right", flexShrink: 0 }}>{T(value)}{best != null ? "/" + T(best) : ""}</div>
    </div>
  );
}

// Consistent tag/pill.
export function Chip({ children, color, bg, solid }) {
  // #31-proof: stringify raw object children (AI data), pass JSX/arrays through.
  const kid = (children && typeof children === "object" && !Array.isArray(children) && children.$$typeof === undefined)
    ? JSON.stringify(children) : children;
  return <span style={{
    fontSize: 9, padding: "1px 7px", borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap",
    color: solid ? "#fff" : color, background: solid ? color : (bg || "#F1F0EC"),
    ...(color && !solid ? { border: `1px solid ${color}30` } : {}),
    display: "inline-flex", alignItems: "center", gap: 3,
  }}>{kid}</span>;
}

// Friendly empty state with optional CTA.
export function EmptyState({ icon = "🔍", title, hint, cta, onCta }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 16px", color: "#6B7280" }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#141B2E" }}>{title}</div>
      {hint && <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.6, maxWidth: 420, margin: "5px auto 0" }}>{hint}</div>}
      {cta && onCta && <button onClick={onCta} style={{ marginTop: 14, padding: "9px 18px", background: "#0E7A4E", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{cta}</button>}
    </div>
  );
}


export function Metric({ label, value, sub, money }) {
  return <div style={{background:"#fff",border:"1px solid #E3E1DA",borderRadius:9,padding:"11px 13px"}}>
    <div style={{fontSize:10,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".08em"}}>{T(label)}</div>
    <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,marginTop:3,color:money?"#0E7A4E":"#141B2E"}}>{T(value)}</div>
    <div style={{fontSize:10,color:"#6B7280",marginTop:2}}>{T(sub)}</div>
  </div>;
}export function Section({ title, color, bg, children }) {
  return (
    <div style={{border:`1px solid ${color}30`,borderRadius:10,overflow:"hidden",marginBottom:0}}>
      <div style={{padding:"9px 14px",background:bg,borderBottom:`1px solid ${color}30`}}>
        <div style={{fontSize:13,fontWeight:700,color:color}}>{T(title)}</div>
      </div>
      <div style={{padding:"12px 14px",background:"#fff"}}>{children}</div>
    </div>
  );
}


// build-1789674503
console.log('BUILD MARKER FORCE');
