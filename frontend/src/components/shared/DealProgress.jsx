import React from "react";
import { Clock, Check, X, User } from "lucide-react";

export const DEAL_STAGES = [
  "Property Assigned",
  "Property Accepted",
  "Offer Submitted",
  "Offer Accepted",
  "Contract Signed",
  "BNP Done",
  "Finance Done",
  "Contract Unconditional",
  "PSI",
  "Settlement Done",
  "Tenanted",
  "Done",
];

export const getDealProgressData = (assignment) => {
  if (!assignment) return { completedCount: 1, terminal: null };
  const zs = (assignment.zohoStatus || "").toLowerCase();
  const ps = assignment.portalStatus || "";

  if (ps === "REJECTED" || /property.{0,15}reject/.test(zs))
    return { completedCount: 1, terminal: { label: "Property Rejected" } };
  if (/offer.{0,15}(withdraw|reject)/.test(zs))
    return {
      completedCount: 3,
      terminal: { label: "Offer Withdrawn by Seller" },
    };

  if (/\bdone\b/.test(zs) && !/bnp|finance|settle/.test(zs))
    return { completedCount: 12, terminal: null };
  if (/tenant/.test(zs)) return { completedCount: 11, terminal: null };
  if (/settle/.test(zs)) return { completedCount: 10, terminal: null };
  if (/\bpsi\b/.test(zs)) return { completedCount: 9, terminal: null };
  if (/unconditional/.test(zs)) return { completedCount: 8, terminal: null };
  if (/finance/.test(zs)) return { completedCount: 7, terminal: null };
  if (/\bbnp\b/.test(zs)) return { completedCount: 6, terminal: null };
  if (/contract.{0,5}sign/.test(zs))
    return { completedCount: 5, terminal: null };
  if (/offer.{0,15}(accept|approv)/.test(zs))
    return { completedCount: 4, terminal: null };
  if (/offer/.test(zs)) return { completedCount: 3, terminal: null };
  if (/property.{0,15}accept/.test(zs) || ps === "ACCEPTED")
    return { completedCount: 2, terminal: null };

  return { completedCount: 1, terminal: null };
};

const DealProgress = ({ assignment }) => {
  const progress = getDealProgressData(assignment);
  
  const stageItems = (() => {
    const { completedCount, terminal } = progress;
    const items = [];
    for (let i = 0; i < DEAL_STAGES.length; i++) {
      if (terminal && i === completedCount) {
        items.push({ type: "terminal", label: terminal.label });
        break;
      }
      const state =
        i < completedCount
          ? "complete"
          : i === completedCount && completedCount < 12
            ? "active"
            : "pending";
      items.push({ type: "stage", label: DEAL_STAGES[i], state, idx: i });
    }
    return items;
  })();

  const rows = [stageItems.slice(0, 6), stageItems.slice(6)];

  return (
    <div className="bg-navy border border-teal/10 rounded-3xl p-8 mb-8">
      <style>{`
        @keyframes stage-progress {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes person-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-stage-progress {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          animation: stage-progress 4s linear infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .animate-person-bounce {
          animation: person-bounce 0.6s ease-in-out infinite;
        }
      `}</style>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="text-teal" size={20} /> Deal Progress
        </h3>
      </div>

      <div className="space-y-10">
        {rows.filter(r => r.length > 0).map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-start">
            {row.map((item, cellIdx) => {
              const isTerminal = item.type === "terminal";
              const state = item.state;
              const isFirstInRow = cellIdx === 0;
              const isLastInRow = cellIdx === row.length - 1;
              const prevState = row[cellIdx - 1]?.state;

              const leftConn = isFirstInRow ? "bg-transparent" : prevState === "complete" ? "bg-teal/40" : "bg-gray-800";
              const rightConn = isLastInRow ? "bg-transparent" : state === "complete" ? "bg-teal/40" : "bg-gray-800";

              const dotClass = isTerminal ? "border-red-500 bg-red-500/20" : state === "complete" ? "border-teal bg-teal" : state === "active" ? "border-teal bg-teal/10" : "border-gray-700 bg-white/[0.02]";
              const labelClass = isTerminal ? "text-red-400 font-bold" : state === "complete" ? "text-gray-400" : state === "active" ? "text-white font-bold" : "text-gray-500";

              const isPurchasedMark = !isTerminal && item.idx === 7 && [
                "contract unconditional", "tenanted", "done", "settlement done", "psi", "social media & gift completed"
              ].includes((assignment?.zohoStatus || "").toLowerCase().trim());

              return (
                <div key={isTerminal ? `t-${cellIdx}` : item.idx} className="flex-1 min-w-0 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    <div className={`h-0.5 flex-1 relative overflow-hidden ${leftConn}`}>
                      {state === "active" && prevState === "complete" && (
                        <div className="animate-stage-progress">
                          <img src="/character.png" className="w-10 h-10 object-contain animate-person-bounce" alt="Progress" />
                          <div className="w-4 h-1 bg-black/40 rounded-full blur-[2px] -mt-1" />
                        </div>
                      )}
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${dotClass}`}>
                      {isTerminal ? <X size={13} className="text-red-400" strokeWidth={2.5} /> : state === "complete" ? <Check size={13} className="text-navy" strokeWidth={3} /> : state === "active" ? <div className="w-3 h-3 rounded-full bg-teal animate-pulse" /> : <span className="text-[9px] text-gray-600 font-bold">{item.idx + 1}</span>}
                    </div>
                    <div className={`h-0.5 flex-1 ${rightConn}`} />
                  </div>
                  <div className="text-center mt-2.5 px-0.5 space-y-1">
                    <p className={`text-[10px] font-bold leading-tight ${labelClass}`}>{item.label}</p>
                    {state === "active" && !isTerminal && <span className="inline-block px-1.5 py-0.5 bg-teal/10 border border-teal/30 text-teal text-[8px] font-bold rounded-full uppercase tracking-widest">Current</span>}
                    {isTerminal && <span className="inline-block px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-bold rounded-full uppercase tracking-widest">Stopped</span>}
                    {isPurchasedMark && <span className="inline-block px-1.5 py-0.5 bg-gold/10 border border-gold/20 text-gold text-[8px] font-bold rounded-full uppercase tracking-widest">Purchased</span>}
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
