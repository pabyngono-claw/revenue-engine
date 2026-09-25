// ── OutcomeRow component ─────────────────────────────────────
import { useState } from "react";
import { LINE, MONEY, MONEY_BG, SIGNAL, SIGNAL_BG, MUTED, DANGER, DANGER_BG, INK } from "../constants.js";

// ── OutcomeRow: proper component to honour Rules of Hooks ─────────────────────
export function OutcomeRow({ s, outcomes, saveOutcome }) {
  const out = outcomes[s.id] || {};
  const [localMrr, setLocalMrr] = useState(out.mrr?.toString() || "");
  const [localNotes, setLocalNotes] = useState(out.notes || "");
  return (
    <div style={{ borderTop: `1px solid ${LINE}`, padding: "10px 14px", background: out.built ? MONEY_BG : "#F9F8F5" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>📊 Outcome tracking</div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>Did you build it?</div>
          <div style={{ display: "flex", gap: 5 }}>
            {[["yes","Built ✓"],["no","Didn't build"]].map(([v,l]) => (
              <button key={v} onClick={async () => { await saveOutcome(s.id, { ...out, built: v==="yes" }); }}
                style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: `1px solid ${out.built===(v==="yes") ? MONEY : LINE}`, background: out.built===(v==="yes") ? MONEY_BG : "#fff", color: out.built===(v==="yes") ? MONEY : MUTED, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
            ))}
          </div>
        </div>
        {out.built && (
          <div>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>MRR reached ($)</div>
            <div style={{ display: "flex", gap: 5 }}>
              <input value={localMrr} onChange={e => setLocalMrr(e.target.value.replace(/[^0-9]/g,""))}
                placeholder="e.g. 4500"
                style={{ width: 100, padding: "5px 8px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "monospace", outline: "none", color: INK, background: "#fff" }} />
              <button onClick={async () => { await saveOutcome(s.id, { ...out, mrr: Number(localMrr)||0 }); }}
                style={{ padding: "5px 10px", background: MONEY, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>Notes</div>
          <div style={{ display: "flex", gap: 5 }}>
            <input value={localNotes} onChange={e => setLocalNotes(e.target.value)}
              placeholder="e.g. Too crowded, pivoted to B2B..."
              style={{ flex: 1, padding: "5px 8px", fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "inherit", outline: "none", color: INK, background: "#fff" }} />
            <button onClick={async () => { await saveOutcome(s.id, { ...out, notes: localNotes }); }}
              style={{ padding: "5px 10px", background: INK, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
          </div>
        </div>
      </div>
      {out.built !== undefined && (
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: out.built ? MONEY_BG : "#F1F0EC", color: out.built ? MONEY : MUTED, fontWeight: 600 }}>{out.built ? "✓ Built" : "✗ Not built"}</span>
          {out.mrr !== undefined && <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: out.mrr>=10000 ? MONEY_BG : SIGNAL_BG, color: out.mrr>=10000 ? MONEY : SIGNAL, fontWeight: 600, fontFamily: "monospace" }}>${out.mrr?.toLocaleString()}/mo MRR</span>}
          {out.notes && <span style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}>{out.notes}</span>}
        </div>
      )}
    </div>
  );
}
