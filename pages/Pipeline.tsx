import React, { useState, useEffect, useCallback, useRef } from "react";
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
  MousePointer,
  X,
  AlertCircle,
  Trash2,
  GripVertical,
  Filter,
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

const formatDateShort = (value: any) => toDate(value).toLocaleDateString();
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

interface PipelineColumn {
  id: LeadStatus;
  title: string;
  leads: LeadData[];
}

// Lead Card Component
function LeadCard({
  lead,
  onClick,
  hasNotes,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  lead: LeadData;
  onClick: () => void;
  hasNotes?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md relative group",
        isDragging && "opacity-50 rotate-2 scale-95",
      )}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical
          size={14}
          className="text-[hsl(var(--muted-foreground))]"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-[hsl(var(--foreground))] text-sm line-clamp-1">
            {lead.name}
          </h4>
          {hasNotes && (
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1" />
          )}
        </div>

        {(lead.workEmail || lead.email) && (
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <Mail size={12} />
            <span className="truncate">{lead.workEmail || lead.email}</span>
          </div>
        )}

        {lead.phoneNumber && (
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="text-[10px] font-bold bg-[hsl(var(--accent))] px-1 rounded text-[hsl(var(--foreground))] opacity-70">
              +91
            </span>
            <span>{lead.phoneNumber}</span>
          </div>
        )}

        {lead.category && (
          <div className="mt-1">
            <span className="text-[10px] font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-2 py-0.5 rounded-full">
              {lead.category}
            </span>
          </div>
        )}

        {(lead.budget || lead.revenueRange) && (
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--foreground))] font-medium pt-1">
            <DollarSign
              size={12}
              className="text-[hsl(var(--muted-foreground))]"
            />
            {lead.budget || lead.revenueRange}
          </div>
        )}

        {(lead.goals || lead.message) && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 italic">
            "{lead.goals || lead.message}"
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] pt-1 border-t border-[hsl(var(--border))]">
          <Calendar size={10} />
          <span>{formatDateShort(lead.createdAt || lead.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

// Pipeline Column Component
function PipelineColumn({
  id,
  title,
  leads,
  onCardClick,
  onDrop,
  onDragOver,
  draggedLeadId,
}: {
  id: LeadStatus;
  title: string;
  leads: LeadData[];
  onCardClick: (lead: LeadData) => void;
  onDrop: (e: React.DragEvent, targetStatus: LeadStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  draggedLeadId?: string | null;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e, id);
  };

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] h-full transition-colors",
        isDragOver && "bg-[hsl(var(--accent))]/20",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between gap-2 p-3 sticky top-0 bg-[hsl(var(--background))] z-10 border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
          {title}
        </h3>
        <span className="text-xs font-mono bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <div key={lead.id}>
              <LeadCard
                lead={lead}
                onClick={() => onCardClick(lead)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", lead.id);
                }}
                onDragEnd={() => {}}
                isDragging={draggedLeadId === lead.id}
              />
            </div>
          ))
        ) : (
          <div
            className={cn(
              "flex items-center justify-center h-24 text-sm text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-md transition-colors",
              isDragOver &&
                "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/10",
            )}
          >
            {isDragOver ? "Drop here" : "No leads"}
          </div>
        )}
      </div>
    </div>
  );
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

// Main Pipeline Page
export const Pipeline: React.FC = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const filteredLeads = leads.filter((lead) => {
    // 1. Filter by Form Type
    if (formTypeFilter !== "all" && lead.formType !== formTypeFilter) {
      return false;
    }

    // 2. Filter by Date
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start).getTime();
      const end = new Date(dateRange.end).getTime() + 86400000;
      const leadDate = lead.createdAt || lead.timestamp;

      if (!leadDate) return false;

      const time =
        typeof leadDate === "string"
          ? new Date(leadDate).getTime()
          : (leadDate as any).seconds
            ? (leadDate as any).seconds * 1000
            : 0;

      if (time < start || time > end) return false;
    }

    return true;
  });

  // Drag scroll functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, left: 0 });

  useEffect(() => {
    const fetchLeads = async () => {
      try {
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
            let querySnapshot;
            try {
              const q = query(
                collection(db, collectionName),
                orderBy("createdAt", "desc"),
              );
              querySnapshot = await getDocs(q);
            } catch {
              querySnapshot = await getDocs(collection(db, collectionName));
            }

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              leadsData.push({
                id: doc.id,
                ...data,
                status: (data.status as LeadStatus) || "leads",
                collection: collectionName,
              } as LeadData);
            });

            if (leadsData.length > 0) break;
          } catch (err: any) {
            lastError = err;
            continue;
          }
        }

        if (leadsData.length === 0 && lastError) {
          setError(`No leads found. Error: ${lastError.message}`);
        } else {
          setLeads(leadsData);
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
      // Revert local state on error (optional, but good practice)
      // fetchLeads();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    const leadId = e.currentTarget.getAttribute("data-lead-id");
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");

    if (leadId) {
      await handleStatusChange(leadId, targetStatus);
    }

    setDraggedLeadId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const getPipelineColumns = (): PipelineColumn[] => {
    const columns: PipelineColumn[] = [
      { id: "leads", title: "Leads", leads: [] },
      { id: "contacted", title: "Contacted", leads: [] },
      { id: "won", title: "Won", leads: [] },
      { id: "lost", title: "Lost", leads: [] },
    ];

    filteredLeads.forEach((lead) => {
      const status = lead.status || "leads";
      const column = columns.find((col) => col.id === status);
      if (column) {
        column.leads.push(lead);
      }
    });

    return columns;
  };

  // Drag scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Check for right click (button 2) or middle click (button 1)
    if ((e.button === 2 || e.button === 1) && scrollContainerRef.current) {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation to prevent conflicts
      setIsDragging(true);
      dragStart.current = {
        x: e.pageX,
        left: scrollContainerRef.current.scrollLeft,
      };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - dragStart.current.x) * 1.5;
      scrollContainerRef.current.scrollLeft = dragStart.current.left - walk;
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const columns = getPipelineColumns();

  return (
    <div className="relative h-full flex flex-col bg-[hsl(var(--background))]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-0 bg-[hsl(var(--background))]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Leads
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1">
            Manage and view your form submissions.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row items-center gap-4">
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
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex gap-4 flex-1 overflow-x-auto p-6 pb-0 select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        {columns.map((column) => (
          <React.Fragment key={column.id}>
            <PipelineColumn
              id={column.id}
              title={column.title}
              leads={column.leads}
              onCardClick={setSelectedLead}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              draggedLeadId={draggedLeadId}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Tip UI */}
      <div className="flex-none p-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/70 backdrop-blur-sm flex items-center justify-center text-xs text-[hsl(var(--muted-foreground))] font-medium z-30 relative">
        <MousePointer size={14} className="mr-2" />
        Tip: Drag cards between columns or hold{" "}
        <kbd className="mx-1 px-1 py-0.5 rounded-md bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold text-[10px]">
          Right Click
        </kbd>{" "}
        to scroll
      </div>

      <LeadDetail
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
};
