import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../src/lib/firebase";
import {
  Loader2,
  ExternalLink,
  Calendar,
  Mail,
  MessageSquare,
  Target,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "../components/ui-primitives";

export type LeadStatus = "leads" | "contacted" | "won" | "lost";

const toDate = (value: any) => {
  if (!value) return new Date(0);
  if (typeof value === "string" || typeof value === "number")
    return new Date(value);
  if ((value as any).seconds) return new Date((value as any).seconds * 1000);
  return new Date(value);
};

const formatDateLong = (value: any) => toDate(value).toLocaleString();

// Helper function for status badge styling
const getStatusBadgeClass = (status: LeadStatus) => {
  switch (status) {
    case "leads":
      return "bg-slate-100 text-slate-700 border-slate-300";
    case "contacted":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "won":
      return "bg-green-100 text-green-700 border-green-300";
    case "lost":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
};

interface LeadData {
  id: string;
  name: string;
  formType: string;
  createdAt: string;
  timestamp: Timestamp | { seconds: number; nanoseconds: number } | string;
  status?: LeadStatus;
  collection?: string;
  // Book Demo fields
  phoneNumber?: string;
  category?: string;
  revenueRange?: string;
  // Contact Us fields
  workEmail?: string;
  email?: string;
  website?: string;
  budget?: string;
  goals?: string;
  message?: string;
}

// Lead Detail Modal
function LeadDetail({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: {
  lead: LeadData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onDelete: (leadId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  if (!lead || !isOpen) return null;

  const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: "leads", label: "Leads" },
    { value: "contacted", label: "Contacted" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {lead.name}
                </h2>
                <div className="flex flex-col gap-1 mt-1">
                  {(lead.workEmail || lead.email) && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                      <Mail size={14} /> {lead.workEmail || lead.email}
                    </p>
                  )}
                  {lead.phoneNumber && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                      <span className="text-xs font-bold">+91</span>{" "}
                      {lead.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg transition-colors"
                    title="Delete lead"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Delete?
                    </span>
                    <button
                      onClick={() => {
                        onDelete(lead.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
                >
                  <X
                    size={20}
                    className="text-[hsl(var(--muted-foreground))]"
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2 block">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onStatusChange(lead.id, option.value);
                        onClose();
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                        lead.status === option.value
                          ? getStatusBadgeClass(option.value)
                          : "bg-white text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1 block">
                    Budget / Revenue / Category
                  </label>
                  <div className="flex flex-col gap-2">
                    {lead.budget && (
                      <p className="text-sm text-[hsl(var(--foreground))] font-medium">
                        Budget: {lead.budget}
                      </p>
                    )}
                    {lead.revenueRange && (
                      <p className="text-sm text-[hsl(var(--foreground))] font-medium">
                        Revenue: {lead.revenueRange}
                      </p>
                    )}
                    {lead.category && (
                      <p className="text-sm text-[hsl(var(--foreground))]">
                        Category:{" "}
                        <span className="text-xs font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
                          {lead.category}
                        </span>
                      </p>
                    )}
                    {!lead.budget && !lead.revenueRange && !lead.category && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        N/A
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1 block">
                    Form Type
                  </label>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      lead.formType === "book-demo"
                        ? "bg-white text-orange-600 border-orange-400"
                        : "bg-white text-orange-700 border-orange-500",
                    )}
                  >
                    {lead.formType === "book-demo" ? "Book Demo" : "Contact"}
                  </span>
                </div>
              </div>

              {lead.website && (
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1 block">
                    Website
                  </label>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[hsl(var(--primary))] hover:opacity-80 text-sm"
                  >
                    <ExternalLink size={14} />
                    <span className="truncate">{lead.website}</span>
                  </a>
                </div>
              )}

              {lead.goals && (
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1 block">
                    Goals
                  </label>
                  <p className="text-sm text-[hsl(var(--foreground))]">
                    {lead.goals}
                  </p>
                </div>
              )}

              {lead.message && (
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1 block">
                    Message
                  </label>
                  <p className="text-sm text-[hsl(var(--foreground))]">
                    {lead.message}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1 block">
                  Submitted
                </label>
                <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                  <Calendar size={14} />
                  <span>
                    {formatDateLong(lead.createdAt || lead.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Try common collection names
        const collectionNames = [
          "leads",
          "forms",
          "submissions",
          "contacts",
          "formSubmissions",
        ];
        let leadsData: LeadData[] = [];
        let lastError: any = null;

        for (const collectionName of collectionNames) {
          try {
            console.log(`Trying collection: ${collectionName}`);
            setDebugInfo(`Checking collection: ${collectionName}...`);

            // First try with orderBy
            try {
              const q = query(
                collection(db, collectionName),
                orderBy("createdAt", "desc"),
              );
              const querySnapshot = await getDocs(q);

              querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`Found document in ${collectionName}:`, data);
                leadsData.push({
                  id: doc.id,
                  ...data,
                  collection: collectionName,
                } as LeadData);
              });

              if (leadsData.length > 0) {
                console.log(
                  `Successfully loaded ${leadsData.length} leads from ${collectionName}`,
                );
                setDebugInfo(
                  `Found ${leadsData.length} leads in collection: ${collectionName}`,
                );
                break;
              }
            } catch (orderByError: any) {
              // If orderBy fails (maybe no index), try without it
              console.log(
                `orderBy failed for ${collectionName}, trying without orderBy:`,
                orderByError.message,
              );

              const querySnapshot = await getDocs(
                collection(db, collectionName),
              );

              querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`Found document in ${collectionName}:`, data);
                leadsData.push({
                  id: doc.id,
                  ...data,
                  collection: collectionName,
                } as LeadData);
              });

              // Sort manually by createdAt if available
              if (leadsData.length > 0) {
                leadsData.sort((a, b) => {
                  const dateA = a.createdAt || a.timestamp;
                  const dateB = b.createdAt || b.timestamp;
                  if (!dateA || !dateB) return 0;
                  const timeA =
                    typeof dateA === "string"
                      ? new Date(dateA).getTime()
                      : (dateA as any).seconds
                        ? (dateA as any).seconds * 1000
                        : 0;
                  const timeB =
                    typeof dateB === "string"
                      ? new Date(dateB).getTime()
                      : (dateB as any).seconds
                        ? (dateB as any).seconds * 1000
                        : 0;
                  return timeB - timeA;
                });
                console.log(
                  `Successfully loaded ${leadsData.length} leads from ${collectionName} (without orderBy)`,
                );
                setDebugInfo(
                  `Found ${leadsData.length} leads in collection: ${collectionName}`,
                );
                break;
              }
            }
          } catch (err: any) {
            console.log(
              `Error with collection ${collectionName}:`,
              err.message,
            );
            lastError = err;
            continue;
          }
        }

        if (leadsData.length === 0 && lastError) {
          console.error(
            "No data found in any collection. Last error:",
            lastError,
          );
          setError(
            `No leads found. Please check Firestore collection name. Tried: ${collectionNames.join(
              ", ",
            )}. Error: ${lastError.message}`,
          );
          setDebugInfo(
            `Checked collections: ${collectionNames.join(", ")}. No data found.`,
          );
        } else if (leadsData.length === 0) {
          setError(
            `No leads found in any of the checked collections: ${collectionNames.join(
              ", ",
            )}`,
          );
          setDebugInfo(
            `Checked collections: ${collectionNames.join(", ")}. No data found.`,
          );
        } else {
          setLeads(leadsData);
          setFilteredLeads(leadsData);
          setDebugInfo("");
        }
      } catch (err: any) {
        console.error("Error fetching leads:", err);
        setError(`Failed to load leads: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;

    // Filter by Date
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start).getTime();
      const end = new Date(dateRange.end).getTime() + 86400000;

      filtered = filtered.filter((lead) => {
        const leadDate = lead.createdAt || lead.timestamp;
        if (!leadDate) return false;

        const time =
          typeof leadDate === "string"
            ? new Date(leadDate).getTime()
            : (leadDate as any).seconds
              ? (leadDate as any).seconds * 1000
              : 0;
        return time >= start && time <= end;
      });
    }

    // Filter by Form Type
    if (formTypeFilter !== "all") {
      filtered = filtered.filter((lead) => lead.formType === formTypeFilter);
    }

    setFilteredLeads(filtered);
  }, [dateRange, formTypeFilter, leads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      // Update local state immediately
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead,
        ),
      );

      // Try to update in Firestore (find the collection)
      const collectionNames = [
        "leads",
        "forms",
        "submissions",
        "contacts",
        "formSubmissions",
      ];
      const lead = leads.find((l) => l.id === leadId);
      const preferredOrder = lead?.collection
        ? [lead.collection, ...collectionNames]
        : collectionNames;

      let updated = false;
      for (const collectionName of preferredOrder) {
        try {
          const leadRef = doc(db, collectionName, leadId);
          await updateDoc(leadRef, { status: newStatus });
          updated = true;
          console.log(
            `Updated status for ${leadId} in ${collectionName} to ${newStatus}`,
          );
          break;
        } catch (err) {
          continue;
        }
      }

      if (!updated) {
        console.warn(
          "Could not find document to update status in any known collection",
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (leadId: string) => {
    try {
      // Update local state immediately
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));

      // Try to delete from Firestore (find the collection)
      const collectionNames = [
        "leads",
        "forms",
        "submissions",
        "contacts",
        "formSubmissions",
      ];
      const lead = leads.find((l) => l.id === leadId);
      const preferredOrder = lead?.collection
        ? [lead.collection, ...collectionNames]
        : collectionNames;

      let deleted = false;
      for (const collectionName of preferredOrder) {
        try {
          const leadRef = doc(db, collectionName, leadId);
          await deleteDoc(leadRef);
          deleted = true;
          console.log(`Deleted document ${leadId} from ${collectionName}`);
          break;
        } catch (err) {
          console.log(`Failed to delete from ${collectionName}:`, err);
          continue;
        }
      }

      if (!deleted) {
        console.warn(
          "Could not find document to delete in any known collection",
        );
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";

    // Handle Firestore Timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    // Handle string date
    return new Date(timestamp).toLocaleString();
  };

  const getStats = () => {
    const total = filteredLeads.length;
    const contacted = filteredLeads.filter(
      (l) => l.status === "contacted",
    ).length;
    const won = filteredLeads.filter((l) => l.status === "won").length;
    return { total, contacted, won };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <>
      <div className="flex-1 min-h-screen bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Leads
            </h1>
            <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1">
              Manage and view your form submissions.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row items-center gap-4">
            {/* Form Type Filter */}
            <div className="flex items-center gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-1">
              <div className="flex items-center gap-2 px-2 border-r border-[hsl(var(--border))] mr-1">
                <Filter
                  size={14}
                  className="text-[hsl(var(--muted-foreground))]"
                />
                <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Type:
                </span>
              </div>
              <select
                className="bg-transparent text-sm border-none focus:ring-0 text-[hsl(var(--foreground))] cursor-pointer pr-8 py-1"
                value={formTypeFilter}
                onChange={(e) => setFormTypeFilter(e.target.value)}
              >
                <option value="all">All Submissions</option>
                <option value="book-demo">Book Demo</option>
                <option value="contact">Contact Us</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-1">
              <div className="flex items-center gap-2 px-2">
                <Calendar
                  size={14}
                  className="text-[hsl(var(--muted-foreground))]"
                />
                <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Filter by Date:
                </span>
              </div>
              <input
                type="date"
                className="bg-transparent text-sm border-none focus:ring-0 text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))] [color-scheme:light] dark:[color-scheme:dark] placeholder:text-[hsl(var(--muted-foreground))]"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
              <span className="text-[hsl(var(--muted-foreground))]">-</span>
              <input
                type="date"
                className="bg-transparent text-sm border-none focus:ring-0 text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))] [color-scheme:light] dark:[color-scheme:dark] placeholder:text-[hsl(var(--muted-foreground))]"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="p-1 hover:bg-[hsl(var(--accent))] rounded-md text-[hsl(var(--muted-foreground))]"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Total Leads
                </p>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-2">
                  {stats.total}
                </h3>
              </div>
              <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-full">
                <Users className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Contacted
                </p>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-2">
                  {stats.contacted}
                </h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Mail className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Won
                </p>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-2">
                  {stats.won}
                </h3>
              </div>
              <div className="p-3 bg-orange-600/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive-foreground))] border border-[hsl(var(--destructive))]/20">
            <p className="font-semibold mb-2">Error loading leads</p>
            <p className="text-sm">{error}</p>
            {debugInfo && (
              <p className="text-xs mt-2 opacity-75">{debugInfo}</p>
            )}
            <p className="text-xs mt-2 opacity-75">
              Please check: 1) Firestore collection name, 2) Firestore security
              rules allow read access, 3) Browser console for detailed errors
            </p>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden lg:block rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-[hsl(var(--border))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget / Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]"
                    >
                      No leads found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[hsl(var(--accent))]/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-[hsl(var(--foreground))]">
                          {lead.name}
                        </div>
                        {(lead.workEmail || lead.email) && (
                          <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] mt-1">
                            <Mail size={12} />
                            <span>{lead.workEmail || lead.email}</span>
                          </div>
                        )}
                        {lead.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] mt-1">
                            <span className="text-xs font-bold bg-[hsl(var(--accent))] px-1 rounded text-[hsl(var(--foreground))] opacity-70">
                              +91
                            </span>
                            <span>{lead.phoneNumber}</span>
                          </div>
                        )}
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[hsl(var(--primary))] hover:opacity-80 mt-1 w-fit"
                          >
                            <ExternalLink size={12} />
                            <span className="truncate max-w-[150px]">
                              {lead.website.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            lead.formType === "book-demo"
                              ? "bg-white text-orange-600 border-orange-400"
                              : "bg-white text-orange-700 border-orange-500",
                          )}
                        >
                          {lead.formType === "book-demo"
                            ? "Book Demo"
                            : "Contact"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.category && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                              Category:
                            </span>
                            <span className="text-xs font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
                              {lead.category}
                            </span>
                          </div>
                        )}
                        {lead.goals && (
                          <div className="flex items-start gap-2">
                            <Target
                              size={14}
                              className="mt-0.5 text-[hsl(var(--muted-foreground))] shrink-0"
                            />
                            <p className="text-[hsl(var(--foreground))] line-clamp-2 max-w-[300px]">
                              {lead.goals}
                            </p>
                          </div>
                        )}
                        {lead.message && (
                          <div className="flex items-start gap-2">
                            <MessageSquare
                              size={14}
                              className="mt-0.5 text-[hsl(var(--muted-foreground))] shrink-0"
                            />
                            <p className="text-[hsl(var(--foreground))] line-clamp-2 max-w-[300px]">
                              {lead.message}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[hsl(var(--foreground))] font-medium">
                          {(lead.budget || lead.revenueRange) && (
                            <DollarSign
                              size={14}
                              className="text-[hsl(var(--muted-foreground))]"
                            />
                          )}
                          {lead.budget || lead.revenueRange || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            getStatusBadgeClass(lead.status || "leads"),
                          )}
                        >
                          {lead.status === "leads" && "Leads"}
                          {lead.status === "contacted" && "Contacted"}
                          {lead.status === "won" && "Won"}
                          {lead.status === "lost" && "Lost"}
                          {!lead.status && "Leads"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(lead.createdAt || lead.timestamp)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-8 text-center text-[hsl(var(--muted-foreground))]">
              No leads found matching your criteria.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm p-4 space-y-3 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[hsl(var(--foreground))] text-base">
                      {lead.name}
                    </h3>
                    {(lead.workEmail || lead.email) && (
                      <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] mt-1 text-sm">
                        <Mail size={14} />
                        <span className="truncate">
                          {lead.workEmail || lead.email}
                        </span>
                      </div>
                    )}
                    {lead.phoneNumber && (
                      <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] mt-1 text-sm">
                        <span className="text-xs font-bold">+91</span>
                        <span>{lead.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0",
                      lead.formType === "book-demo"
                        ? "bg-white text-orange-600 border-orange-400"
                        : "bg-white text-orange-700 border-orange-500",
                    )}
                  >
                    {lead.formType === "book-demo" ? "Book Demo" : "Contact"}
                  </span>
                </div>

                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[hsl(var(--primary))] hover:opacity-80 text-sm"
                  >
                    <ExternalLink size={14} />
                    <span className="truncate">
                      {lead.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}

                {(lead.goals || lead.message || lead.category) && (
                  <div className="space-y-2">
                    {lead.category && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                          Category:
                        </span>
                        <span className="text-xs font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
                          {lead.category}
                        </span>
                      </div>
                    )}
                    {lead.goals && (
                      <div className="flex items-start gap-2">
                        <Target
                          size={14}
                          className="mt-0.5 text-[hsl(var(--muted-foreground))] shrink-0"
                        />
                        <p className="text-[hsl(var(--foreground))] text-sm">
                          {lead.goals}
                        </p>
                      </div>
                    )}
                    {lead.message && (
                      <div className="flex items-start gap-2">
                        <MessageSquare
                          size={14}
                          className="mt-0.5 text-[hsl(var(--muted-foreground))] shrink-0"
                        />
                        <p className="text-[hsl(var(--foreground))] text-sm">
                          {lead.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-1.5 text-[hsl(var(--foreground))] font-medium text-sm">
                    {(lead.budget || lead.revenueRange) && (
                      <DollarSign
                        size={14}
                        className="text-[hsl(var(--muted-foreground))]"
                      />
                    )}
                    {lead.budget || lead.revenueRange || "N/A"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] text-xs">
                    <Calendar size={12} />
                    {formatDate(lead.createdAt || lead.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <LeadDetail
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </>
  );
};
