import React from "react";

export const getStatusConfig = (item) => {
  const zohoLabel = item.assignment?.zohoStatus;
  const portalStatus = item.portalStatus;
  
  const isPurchased = (it) => {
    const zs = (it.assignment?.zohoStatus || "").toLowerCase();
    return [
      "purchased", "settled", "contract unconditional", "tenanted", "done",
      "settlement done", "psi", "social media & gift completed"
    ].includes(zs.trim());
  };

  if (isPurchased(item)) {
    return { cls: "bg-gold text-navy", label: zohoLabel || "Purchased" };
  }

  switch (portalStatus) {
    case "ACCEPTED":
      return { cls: "bg-teal text-navy", label: zohoLabel || "Accepted" };
    case "REJECTED":
      return { cls: "bg-red-500 text-white", label: zohoLabel || "Rejected" };
    case "PENDING":
      return {
        cls: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
        label: zohoLabel || "Assigned",
      };
    default:
      return {
        cls: "bg-gray-500/20 text-gray-400",
        label: zohoLabel || portalStatus || "—",
      };
  }
};

const StatusBadge = ({ item }) => {
  const { cls, label } = getStatusConfig(item);
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
