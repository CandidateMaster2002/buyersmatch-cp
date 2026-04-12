import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import {
  ChevronLeft,
  Loader2,
  Building2,
  Search,
  Bed,
  Bath,
  Car,
  Scale,
  X,
  Check,
  Lock,
  DollarSign,
  MapPin,
  Clock,
  Tag,
  Users,
  Percent,
  PiggyBank,
  Home,
  CheckCircle2,
  XCircle,
  FileText,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import {
  getAdminClientProfile,
  getClientProperties,
  getPropertyDocuments,
} from "../../api/client";
import { anonymizeName, anonymizeEmail, anonymizeProperty, anonymizeBrief } from "../../utils/anonymize";

// ─── Formatting helpers ────────────────────────────────────────────────────────
const fmt = (v) => (v != null ? v : "—");
const fmtMoney = (v) => (v != null ? `$${Number(v).toLocaleString()}` : "—");
const fmtPct = (v) => (v != null ? `${v}%` : "—");
const fmtArr = (arr) =>
  Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "—";

// ─── Buyer Brief sub-components ────────────────────────────────────────────────
const BriefSection = ({ icon: Icon, label, children }) => (
  <div className="bg-forest border border-white/5 rounded-2xl overflow-hidden">
    <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center gap-2">
      <Icon size={15} className="text-sage" />
      <p className="text-[11px] font-bold text-sage uppercase tracking-widest">
        {label}
      </p>
    </div>
    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {children}
    </div>
  </div>
);

const BriefField = ({ label, value, highlight }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
      {label}
    </p>
    <p
      className={`text-sm font-semibold ${highlight ? "text-sage" : "text-white"}`}
    >
      {value}
    </p>
  </div>
);

const BuyerBriefView = ({ brief }) => {
  if (!brief) return null;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-xs text-gray-500 font-mono">{brief.zohoBriefId}</p>
        <div className="flex items-center gap-2">
          {brief.priority && (
            <span className="px-3 py-1 bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold rounded-full uppercase tracking-widest">
              {brief.priority}
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              brief.status?.toLowerCase() === "active"
                ? "bg-sage/10 border-sage/30 text-sage"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            {brief.status || "Active"}
          </span>
        </div>
      </div>

      <BriefSection icon={DollarSign} label="Budget & Deposit">
        <BriefField
          label="Min Budget"
          value={fmtMoney(brief.minBudget)}
          highlight
        />
        <BriefField
          label="Max Budget"
          value={fmtMoney(brief.maxBudget)}
          highlight
        />
        <BriefField
          label="Available Deposit"
          value={fmtMoney(brief.availableDeposit)}
        />
        <BriefField
          label="Deposit / Equity %"
          value={fmtPct(brief.depositEquityPercent)}
        />
      </BriefSection>

      <BriefSection icon={Home} label="Property Preferences">
        <BriefField
          label="Property Types"
          value={fmtArr(brief.propertyTypes)}
        />
        <BriefField
          label="Preferred States"
          value={fmtArr(brief.preferredStates)}
        />
        <div className="sm:col-span-2">
          <BriefField
            label="Preferred Suburbs"
            value={fmt(brief.preferredSuburbs)}
          />
        </div>
        <BriefField
          label="Bed / Bath / Garage"
          value={fmt(brief.bedBathGarage)}
        />
        <BriefField label="Land Size (sqm)" value={fmt(brief.landSizeSqm)} />
      </BriefSection>

      <BriefSection icon={Percent} label="Investment Criteria">
        <BriefField
          label="Target Yield"
          value={fmtPct(brief.yieldPercent)}
          highlight
        />
        <BriefField label="Weekly Rent" value={fmtMoney(brief.weeklyRent)} />
        <BriefField
          label="Monthly Holding Cost"
          value={fmtMoney(brief.monthlyHoldingCost)}
        />
        <BriefField label="Interest Rate" value={fmtPct(brief.interestRate)} />
        <BriefField label="Tax Rate" value={fmtPct(brief.taxRate)} />
      </BriefSection>

      <BriefSection icon={Clock} label="Timeline & Finance">
        <BriefField label="Timeline to Buy" value={fmt(brief.timelineToBuy)} />
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
            Pre-Approved
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {brief.preApproved === true ? (
              <>
                <CheckCircle2 size={14} className="text-sage" />
                <span className="text-sm font-semibold text-sage">Yes</span>
              </>
            ) : brief.preApproved === false ? (
              <>
                <XCircle size={14} className="text-red-400" />
                <span className="text-sm font-semibold text-red-400">No</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-white">—</span>
            )}
          </div>
        </div>
        <BriefField label="Financer" value={fmt(brief.financerName)} />
      </BriefSection>

      {Array.isArray(brief.assignedAgents) &&
        brief.assignedAgents.length > 0 && (
          <BriefSection icon={Users} label="Assigned Agents">
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              {brief.assignedAgents.map((agent, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-sage/10 border border-sage/20 text-sage text-xs font-semibold rounded-xl"
                >
                  {agent}
                </span>
              ))}
            </div>
          </BriefSection>
        )}
    </div>
  );
};

// ─── Comparison Modal ──────────────────────────────────────────────────────────
const ComparisonModal = ({ properties, onClose }) => {
  if (!properties || properties.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-forest border border-sage/30 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 md:p-6 border-b border-sage/20 flex items-center justify-between bg-forest/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Scale className="text-sage" size={20} />
            <h2 className="text-lg md:text-2xl font-bold text-white">
              Property Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(180px,1fr))] md:grid-cols-[150px_repeat(auto-fit,minmax(200px,1fr))] gap-3 md:gap-4 min-w-[600px] md:min-w-[800px]">
            <div className="space-y-3 md:space-y-4 pt-[140px] md:pt-[200px]">
              {[
                "Address",
                "Price Range",
                "Yield",
                "Bedrooms",
                "Bathrooms",
                "Car Parking",
                "Land Size",
                "Year Built",
                "Status",
              ].map((l) => (
                <div
                  key={l}
                  className="h-10 md:h-12 flex items-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest"
                >
                  {l}
                </div>
              ))}
            </div>
            {properties.map((item) => (
              <div key={item.id} className="space-y-3 md:space-y-4">
                <div className="h-[120px] md:h-[180px] rounded-xl md:rounded-2xl overflow-hidden border border-sage/20 mb-2 md:mb-4">
                  <img
                    src={
                      item.firstImage ||
                      `https://placehold.co/400x300/2D3A2E/52B788?text=IMG`
                    }
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm font-bold text-white truncate px-1 md:px-2">
                  {item.property.addressLine1}
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm font-bold text-gold px-1 md:px-2">
                  ${item.property.askingPriceMin / 1000}k - $
                  {item.property.askingPriceMax / 1000}k
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm font-bold text-sage px-1 md:px-2">
                  {item.property.yieldPercent}%
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm text-gray-300 px-1 md:px-2">
                  {item.property.bedrooms} Bed
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm text-gray-300 px-1 md:px-2">
                  {item.property.bathrooms} Bath
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm text-gray-300 px-1 md:px-2">
                  {item.property.carParking} Car
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm text-gray-300 px-1 md:px-2">
                  {item.property.areaSqm} sqm
                </div>
                <div className="h-10 md:h-12 flex items-center text-xs md:text-sm text-gray-300 px-1 md:px-2">
                  {item.property.yearBuilt || "N/A"}
                </div>
                <div className="h-10 md:h-12 flex items-center px-1 md:px-2">
                  <span className="px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider bg-sage/10 text-sage border border-sage/30">
                    {item.portalStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Purchased detection ───────────────────────────────────────────────────────
const PURCHASED_KEYWORDS = ["unconditional", "psi", "settl", "tenant"];
const isPurchasedItem = (item) => {
  if (item.portalStatus === "PURCHASED") return true;
  const zs = (item.assignment?.zohoStatus || "").toLowerCase();
  if (PURCHASED_KEYWORDS.some((kw) => zs.includes(kw))) return true;
  if (/\bdone\b/.test(zs) && !/bnp|finance/.test(zs)) return true;
  return false;
};

// ─── Main component ────────────────────────────────────────────────────────────
const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [properties, setProperties] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [mainTab, setMainTab] = useState("PROPERTIES");
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBriefId, setSelectedBriefId] = useState("ALL");
  const [selectedActiveBriefId, setSelectedActiveBriefId] = useState(null);

  // Compare
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const activeBriefs = useMemo(
    () => briefs.filter((b) => b.status?.toLowerCase() !== "closed"),
    [briefs],
  );

  const displayedBrief = useMemo(
    () =>
      activeBriefs.find((b) => b.zohoBriefId === selectedActiveBriefId) ||
      activeBriefs[0] ||
      null,
    [activeBriefs, selectedActiveBriefId],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, responseData] = await Promise.all([
          getAdminClientProfile(id),
          getClientProperties(id),
        ]);
        setClient(profile);

        const { assignments, briefs: userBriefs } = responseData;
        const loaded = (userBriefs || []).map(b => anonymizeBrief(b));
        setBriefs(loaded);

        const firstActive = loaded.find(
          (b) => b.status?.toLowerCase() !== "closed",
        );
        if (firstActive) setSelectedActiveBriefId(firstActive.zohoBriefId);

        const propertiesWithImages = await Promise.all(
          assignments.map(async (item) => {
            if (!item.propertyId) return { ...item, firstImage: null, property: anonymizeProperty(item.property) };
            try {
              const docs = await getPropertyDocuments(item.propertyId);
              return {
                ...item,
                firstImage: docs.propertyImages?.[0]?.url || null,
                property: anonymizeProperty(item.property),
              };
            } catch {
              return { ...item, firstImage: null, property: anonymizeProperty(item.property) };
            }
          }),
        );
        setProperties(propertiesWithImages);
      } catch (err) {
        console.error("Error fetching client details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const stats = useMemo(() => {
    const relevant = properties.filter(
      (item) =>
        selectedBriefId === "ALL" || item.zohoBriefId === selectedBriefId,
    );
    const purchased = relevant.filter(isPurchasedItem);
    const purchasedIds = new Set(purchased.map((p) => p.assignment?.id));
    const notPurchased = relevant.filter(
      (p) => !purchasedIds.has(p.assignment?.id),
    );
    return {
      total: relevant.length,
      assigned: notPurchased.filter((p) => p.portalStatus === "PENDING").length,
      accepted: notPurchased.filter((p) => p.portalStatus === "ACCEPTED")
        .length,
      rejected: relevant.filter((p) => p.portalStatus === "REJECTED").length,
      purchased: purchased.length,
    };
  }, [properties, selectedBriefId]);

  const getStatusBadge = (item) => {
    if (isPurchasedItem(item))
      return { cls: "bg-gold text-forest", label: "PURCHASED" };
    switch (item.portalStatus) {
      case "ACCEPTED":
        return { cls: "bg-sage text-forest", label: "ACCEPTED" };
      case "REJECTED":
        return { cls: "bg-red-500 text-white", label: "REJECTED" };
      case "PENDING":
        return {
          cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
          label: "ASSIGNED",
        };
      default:
        return {
          cls: "bg-gray-500/20 text-gray-400",
          label: item.portalStatus || "—",
        };
    }
  };

  const filteredProperties = properties.filter((item) => {
    if (!item.property) return false;
    const matchesBrief =
      selectedBriefId === "ALL" || item.zohoBriefId === selectedBriefId;
    const matchesSearch =
      (item.property.addressLine1 || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.property.suburb || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const purchased = isPurchasedItem(item);
    let matchesTab;
    if (activeTab === "ALL") matchesTab = true;
    else if (activeTab === "PURCHASED") matchesTab = purchased;
    else if (activeTab === "REJECTED")
      matchesTab = item.portalStatus === "REJECTED";
    else if (activeTab === "ACCEPTED")
      matchesTab = item.portalStatus === "ACCEPTED" && !purchased;
    else if (activeTab === "PENDING")
      matchesTab = item.portalStatus === "PENDING" && !purchased;
    else matchesTab = item.portalStatus === activeTab;
    return matchesBrief && matchesSearch && matchesTab;
  });

  const toggleCompare = (property) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === property.assignment.id);
      if (exists) return prev.filter((p) => p.id !== property.assignment.id);
      if (prev.length >= 3) return prev;
      return [...prev, { ...property, id: property.assignment.id }];
    });
  };

  const clientName = anonymizeName(
    client?.fullName || client?.buyerBrief?.fullName
  ) || "Client";

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-sage" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={clientName}>
      <div className="space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate("/admin/clients")}
          className="flex items-center gap-2 text-gray-400 hover:text-sage transition-colors group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Client Management
        </button>

        {/* Client banner */}
        <div className="bg-sage/10 border border-sage/30 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-sage/20 flex items-center justify-center text-sage text-2xl font-bold shrink-0">
              {clientName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{clientName}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {anonymizeEmail(
                  client?.loginEmail || client?.email || client?.buyerBrief?.email
                ) || ""}
              </p>
              {client?.zohoContactId && (
                <p className="text-xs font-mono text-gray-500 mt-0.5">
                  {client.zohoContactId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Tabs — same as client dashboard */}
        <div className="flex gap-1 bg-forest border border-white/10 rounded-2xl p-1 w-fit">
          {[
            { key: "PROPERTIES", label: "My Properties", icon: Building2 },
            { key: "BRIEF", label: "My Buyer Brief", icon: Briefcase },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mainTab === key
                  ? "bg-sage text-forest shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* ── MY BUYER BRIEF TAB ──────────────────────────────────────────────── */}
        {mainTab === "BRIEF" && (
          <div>
            {activeBriefs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <Briefcase className="text-sage mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">
                  No active buyer briefs
                </h3>
                <p className="text-gray-400 text-center max-w-sm">
                  No active buyer briefs found for this client.
                </p>
              </div>
            ) : (
              <>
                {activeBriefs.length > 1 && (
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      Viewing brief:
                    </span>
                    <div className="relative">
                      <select
                        value={selectedActiveBriefId || ""}
                        onChange={(e) =>
                          setSelectedActiveBriefId(e.target.value)
                        }
                        className="appearance-none bg-forest border border-sage/30 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-sage focus:outline-none focus:border-sage transition-all cursor-pointer"
                      >
                        {activeBriefs.map((b) => (
                          <option key={b.zohoBriefId} value={b.zohoBriefId}>
                            {b.zohoBriefId}
                            {b.status ? ` — ${b.status}` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none"
                      />
                    </div>
                  </div>
                )}
                <BuyerBriefView brief={displayedBrief} />
              </>
            )}
          </div>
        )}

        {/* ── MY PROPERTIES TAB ───────────────────────────────────────────────── */}
        {mainTab === "PROPERTIES" && (
          <>
            {/* Stats + brief filter */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  {
                    label: "Total",
                    value: stats.total,
                    color: "text-white",
                    bg: "bg-white/5",
                  },
                  {
                    label: "Assigned",
                    value: stats.assigned,
                    color: "text-emerald-300",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    label: "Accepted",
                    value: stats.accepted,
                    color: "text-sage",
                    bg: "bg-sage/10",
                  },
                  {
                    label: "Rejected",
                    value: stats.rejected,
                    color: "text-red-400",
                    bg: "bg-red-400/10",
                  },
                  {
                    label: "Purchased",
                    value: stats.purchased,
                    color: "text-gold",
                    bg: "bg-gold/10",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`${s.bg} border border-white/10 px-4 py-3 rounded-xl min-w-[80px]`}
                  >
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">
                      {s.label}
                    </p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {activeBriefs.length > 1 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                    Filter by brief:
                  </span>
                  <div className="relative">
                    <select
                      value={selectedBriefId}
                      onChange={(e) => setSelectedBriefId(e.target.value)}
                      className="appearance-none bg-forest border border-sage/30 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-sage focus:outline-none focus:border-sage transition-all cursor-pointer"
                    >
                      <option value="ALL">
                        All Briefs ({activeBriefs.length})
                      </option>
                      {activeBriefs.map((b) => (
                        <option key={b.zohoBriefId} value={b.zohoBriefId}>
                          {b.zohoBriefId}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search + Status Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by address or suburb..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-forest border border-sage/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-sage transition-all"
                />
              </div>
              <div className="flex bg-forest border border-sage/20 rounded-xl p-1">
                {[
                  { key: "ALL", label: "ALL" },
                  { key: "PENDING", label: "ASSIGNED" },
                  { key: "ACCEPTED", label: "ACCEPTED" },
                  { key: "REJECTED", label: "REJECTED" },
                  { key: "PURCHASED", label: "PURCHASED" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === key
                        ? key === "PURCHASED"
                          ? "bg-gold text-forest"
                          : "bg-sage text-forest"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Bar */}
            {compareList.length > 0 && (
              <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
                <div className="bg-forest/90 backdrop-blur-md border border-sage/50 rounded-2xl p-3 md:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex -space-x-3">
                      {compareList.map((p) => (
                        <div
                          key={p.id}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-forest overflow-hidden bg-sage/20 flex-shrink-0"
                        >
                          <img
                            src={p.firstImage}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs md:text-sm font-bold text-white whitespace-nowrap">
                      {compareList.length}{" "}
                      {compareList.length === 1 ? "Property" : "Properties"}{" "}
                      selected
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setCompareList([])}
                      className="text-gray-400 hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-2"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowCompareModal(true)}
                      disabled={compareList.length < 2}
                      className="flex-1 sm:flex-none bg-sage text-forest px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-sage/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Scale size={16} />
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Properties Table */}
            {filteredProperties.length > 0 ? (
              <div className="bg-forest border border-sage/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-sage/20">
                        <th className="px-6 py-4 w-12" />
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Property
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Specs
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Price Range
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Rental Yield
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Rental Situation
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProperties.map((item) => {
                        const isComparing = compareList.find(
                          (p) => p.id === item.assignment.id,
                        );
                        const isOffMarket = /off.?market/i.test(
                          item.property.saleType || "",
                        );
                        const rentalYield =
                          item.assignment?.rentalYield ??
                          item.property.yieldPercent;
                        const { cls, label } = getStatusBadge(item);
                        return (
                          <tr
                            key={item.assignment.id}
                            onClick={() =>
                              navigate(
                                `/admin/client/${id}/property/${item.propertyId}`,
                              )
                            }
                            className={`cursor-pointer hover:bg-sage/5 transition-colors group ${isComparing ? "bg-sage/5" : ""}`}
                          >
                            <td
                              className="px-6 py-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => toggleCompare(item)}
                                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${isComparing ? "bg-sage border-sage text-forest" : "border-white/20 text-transparent group-hover:text-gray-500"}`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-white font-bold text-sm">
                                    {item.property.addressLine1}
                                  </p>
                                  {isOffMarket && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[8px] font-bold rounded tracking-widest shrink-0">
                                      <Lock size={8} /> OFF MARKET
                                    </span>
                                  )}
                                </div>
                                <p className="text-sage text-xs mt-0.5">
                                  {item.property.suburb}, {item.property.state}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Bed size={12} /> {item.property.bedrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bath size={12} /> {item.property.bathrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Car size={12} /> {item.property.carParking}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gold font-bold text-sm">
                                ${item.property.askingPriceMin / 1000}k – $
                                {item.property.askingPriceMax / 1000}k
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sage font-bold text-sm">
                                {rentalYield != null ? `${rentalYield}%` : "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-300">
                                {item.property.rentalSituation || "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}
                              >
                                {label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="text-sage" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No properties found
                </h3>
                <p className="text-gray-400 text-center max-w-sm">
                  {searchQuery || activeTab !== "ALL"
                    ? "Try adjusting your search or filters."
                    : "No properties have been assigned to this client yet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showCompareModal && (
        <ComparisonModal
          properties={compareList}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </AdminLayout>
  );
};

export default ClientDetail;
