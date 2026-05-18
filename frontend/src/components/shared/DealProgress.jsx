import React from "react";
import { Clock, Check, X, ShieldX, AlertTriangle } from "lucide-react";

// ─── Stage definitions ───────────────────────────────────────────────────────
// optional: true  → shown with dashed border when skipped (PPI Done, BNP Done)
export const DEAL_STAGES = [
  { key: "assigned",             label: "Property\nAssigned",              optional: false },
  { key: "accepted",             label: "Property\nAccepted",              optional: false },
  { key: "offer_submitted",      label: "Offer\nSubmitted",                optional: false },
  { key: "offer_accepted",       label: "Offer\nAccepted",                 optional: false },
  { key: "contract_received",    label: "Contract\nReceived",              optional: false },
  { key: "conveyancer_approved", label: "Conveyancer\nApproved",           optional: false },
  { key: "contract_signed",      label: "Contract\nSigned",                optional: false },
  { key: "bnp_done",             label: "BNP\nDone",                       optional: true  },
  { key: "finance_done",         label: "Finance\nDone",                   optional: false },
  { key: "unconditional",        label: "Contract\nUnconditional",         optional: false },
  { key: "psi_done",             label: "PSI\nDone",                       optional: false },
  { key: "settlement_done",      label: "Settlement\nDone",                optional: false },
  { key: "tenanted",             label: "Tenanted",                        optional: false },
  { key: "social_media",         label: "Social Media &\nGift Completed",  optional: false },
  { key: "done",                 label: "Done",                            optional: false },
];

// ─── Status analyser ─────────────────────────────────────────────────────────
// Zoho naming mismatches handled here:
//   "Offer Accepted1"     → Offer Accepted   (display stage 3)
//   "Offer Accepted"      → Contract Received (display stage 4)
//   "Conveyencer Approved"→ Conveyancer Approved (display stage 5)  [Zoho typo]
//   "Social Media Completed" → Social Media & Gift Completed (display stage 14)
export const analyzeStatus = (assignment) => {
  if (!assignment) return { isTerminal: false, currentIdx: 0 };

  const zs  = (assignment.zohoStatus || "").trim();
  const zsL = zs.toLowerCase();
  const ps  = (assignment.portalStatus || "").toUpperCase();

  // ── Terminal checks ──
  if (ps === "REJECTED" || /property.{0,15}reject/i.test(zsL))
    return { isTerminal: true, terminalLabel: "Property Rejected", terminalType: "rejected" };

  if (/offer.{0,20}(withdrawn|withdraw|reject)/i.test(zsL))
    return { isTerminal: true, terminalLabel: "Offer Withdrawn", terminalType: "withdrawn" };

  // ── Normal stage detection (most-advanced → least-advanced) ──
  let currentIdx = 0;

  if      (/\bdone\b/.test(zsL) && !/bnp|finance|settle|ppi|psi/i.test(zsL))   currentIdx = 14;
  else if (/social.?media/i.test(zsL))                                  currentIdx = 13;
  else if (/tenant/i.test(zsL))                                         currentIdx = 12;
  else if (/settle/i.test(zsL))                                         currentIdx = 11;
  else if (/\bpsi\b/i.test(zsL))                                        currentIdx = 10;
  else if (/unconditional/i.test(zsL))                                  currentIdx = 9;
  else if (/finance/i.test(zsL))                                        currentIdx = 8;
  else if (/\bbnp\b/i.test(zsL))                                        currentIdx = 7;
  else if (/contract.{0,5}sign/i.test(zsL) || /\bppi\s*done\b/i.test(zsL)) currentIdx = 6;
  // Zoho typo "Conveyencer" handled via flexible regex, also treat PPI Completed as this stage
  else if (/convey[ae]nc[ae]r?.{0,10}approv/i.test(zsL) || /\bppi\s*completed\b/i.test(zsL)) currentIdx = 5;
  // "Offer Accepted" (no trailing digit) → Contract Received
  else if (/offer accepted(?!\d)/i.test(zsL))                           currentIdx = 4;
  // "Offer Accepted1" → Offer Accepted
  else if (/offer accepted1/i.test(zsL))                                currentIdx = 3;
  else if (/offer.{0,10}submit/i.test(zsL))                             currentIdx = 2;
  else if (ps === "ACCEPTED" || /property.{0,15}accept/i.test(zsL))    currentIdx = 1;
  else                                                                   currentIdx = 0;

  return { isTerminal: false, currentIdx };
};

// ─── Terminal status banner ───────────────────────────────────────────────────
const TerminalBanner = ({ label, type }) => {
  const isRejected = type === "rejected";
  return (
    <div className={`rounded-3xl border p-8 mb-8 flex items-center gap-6 ${
      isRejected
        ? "bg-red-500/5 border-red-500/30"
        : "bg-amber-500/5 border-amber-500/30"
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
        isRejected ? "bg-red-500/15" : "bg-amber-500/15"
      }`}>
        {isRejected
          ? <ShieldX size={28} className="text-red-400" />
          : <AlertTriangle size={28} className="text-amber-400" />
        }
      </div>
      <div>
        <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${
          isRejected ? "text-red-500" : "text-amber-500"
        }`}>Deal Stopped</p>
        <p className={`text-xl font-bold ${
          isRejected ? "text-red-300" : "text-amber-300"
        }`}>{label}</p>
        <p className="text-sm text-gray-500 mt-1">
          {isRejected
            ? "This property has been rejected and the deal is no longer active."
            : "The offer has been withdrawn and the deal is no longer active."
          }
        </p>
      </div>
      <span className={`ml-auto shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${
        isRejected
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
      }`}>
        {isRejected ? "Rejected" : "Withdrawn"}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const DealProgress = ({ assignment }) => {
  const { isTerminal, terminalLabel, terminalType, currentIdx } =
    analyzeStatus(assignment);

  // Terminal → show banner only, no progress track
  if (isTerminal) {
    return <TerminalBanner label={terminalLabel} type={terminalType} />;
  }

  // Build per-stage state
  // optional stages that are "between" already-completed stages are shown as "skipped"
  const stageStates = DEAL_STAGES.map((stage, idx) => {
    if (idx < currentIdx) {
      if (stage.optional) {
        if (stage.key === "bnp_done") return "complete";
        return "skipped";
      }
      return "complete";
    }
    if (idx === currentIdx) return "active";
    return "pending";
  });

  // Split into rows: [0-4], [5-9], [10-14] (5 items per row)
  const rows = [
    DEAL_STAGES.slice(0, 5).map((s, i) => ({ ...s, idx: i, state: stageStates[i] })),
    DEAL_STAGES.slice(5, 10).map((s, i) => ({ ...s, idx: i + 5, state: stageStates[i + 5] })),
    DEAL_STAGES.slice(10).map((s, i) => ({ ...s, idx: i + 10, state: stageStates[i + 10] })),
  ];

  const isDone = currentIdx === 14;

  return (
    <div className="bg-navy border border-teal/10 rounded-3xl p-8 mb-8">
      <style>{`
        @keyframes stage-progress {
          0%   { left: 0%;   opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes person-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .animate-stage-progress {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          animation: stage-progress 3.5s linear infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .animate-person-bounce {
          animation: person-bounce 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="text-teal" size={20} /> Deal Progress
        </h3>
        {isDone && (
          <span className="px-3 py-1 bg-teal/15 border border-teal/30 text-teal text-xs font-bold rounded-full uppercase tracking-widest">
            ✓ Completed
          </span>
        )}
      </div>

      <div className="space-y-10">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={`flex items-start ${rowIdx === 2 ? "justify-center" : ""}`}>
            {row.map((item, cellIdx) => {
              // For last row, keep it evenly spaced as 5 items
              const itemWidthClass = "flex-1";
              const { state, optional, label, idx } = item;
              const isFirst = cellIdx === 0;
              const isLast  = cellIdx === row.length - 1;
              const prevState = row[cellIdx - 1]?.state;

              // Connector colours
              const leftConn  = isFirst       ? "bg-transparent"
                              : (prevState === "complete" || prevState === "skipped") ? "bg-teal/50" : "bg-white/15";
              // Right connector: light up if current (runner travels here) or already complete
              const rightConn = isLast        ? "bg-transparent"
                              : (state === "complete" || state === "active" || state === "skipped") ? "bg-teal/50" : "bg-white/15";

              // Dot style — active treated same as complete (you've REACHED this stage)
              const dotClass =
                state === "complete" ? "border-teal bg-teal" :
                state === "active"   ? "border-teal bg-teal shadow-[0_0_14px_rgba(42,191,191,0.7)]" :
                state === "skipped"  ? "border-white/30 bg-white/5 border-dashed" :
                optional             ? "border-white/30 bg-white/5 border-dashed" :
                                       "border-white/30 bg-white/5";

              // Label style
              const labelClass =
                state === "complete" ? "text-gray-400" :
                state === "active"   ? "text-white font-bold" :
                state === "skipped"  ? "text-gray-500" :
                optional             ? "text-gray-500" :
                                       "text-gray-400";

              // Runner shows on the RIGHT connector after the current stage
              const showRunner = state === "active" && !isLast;

              return (
                <div
                  key={idx}
                  className={`min-w-0 flex flex-col items-center ${rowIdx === 2 ? itemWidthClass : "flex-1"}`}
                >
                  <div className="flex items-center w-full">
                    {/* Left connector */}
                    <div className={`h-0.5 flex-1 relative overflow-hidden ${leftConn}`} />

                    {/* Dot — checkmark for both complete AND active (reached = achieved) */}
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${dotClass}`}>
                      {(state === "complete" || state === "active") ? (
                        <Check size={14} className="text-navy" strokeWidth={3} />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Right connector — runner travels here after current stage */}
                    <div className={`h-0.5 flex-1 relative overflow-hidden ${rightConn}`}>
                      {showRunner && (
                        <div className="animate-stage-progress">
                          <img
                            src="/character.png"
                            className="w-10 h-10 object-contain animate-person-bounce"
                            alt="Progress"
                          />
                          <div className="w-4 h-1 bg-black/40 rounded-full blur-[2px] -mt-1" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-center mt-3 px-1 space-y-1">
                    {label.split("\n").map((line, li) => (
                      <p key={li} className={`text-[11px] leading-tight ${labelClass}`}>
                        {line}
                      </p>
                    ))}
                    {state === "active" && (
                      <span className="inline-block px-1.5 py-0.5 bg-teal/10 border border-teal/30 text-teal text-[8px] font-bold rounded-full uppercase tracking-widest">
                        Current
                      </span>
                    )}


                    {isDone && idx === 14 && (
                      <span className="inline-block px-1.5 py-0.5 bg-teal/10 border border-teal/20 text-teal text-[8px] font-bold rounded-full uppercase tracking-widest">
                        Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealProgress;
