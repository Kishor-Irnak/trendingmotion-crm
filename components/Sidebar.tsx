import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Box,
  LogOut,
  User,
  Kanban,
} from "lucide-react";
import { cn } from "./ui-primitives";

interface SidebarProps {
  onOpenNewLead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative",
      isActive
        ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
        : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
    );

  const iconClass =
    "text-[hsl(var(--sidebar-foreground))] opacity-60 group-hover:opacity-100 transition-opacity";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          "bg-[hsl(var(--sidebar))] border-[hsl(var(--sidebar-border))]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="p-4 pb-2">
          <button className="w-full flex items-center gap-2 px-1 py-1 text-sm font-semibold text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] rounded-lg transition-colors">
            <Box
              size={20}
              className="text-[hsl(var(--sidebar-foreground))] fill-[hsl(var(--sidebar-foreground))]"
            />
            <span>Evoc Labs.</span>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-2 space-y-6 mt-4">
          {/* Main Group */}
          <div className="space-y-0.5">
            <NavLink
              to="/"
              className={navClass}
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <LayoutDashboard size={18} className={iconClass} />
              Dashboard
            </NavLink>
            <NavLink
              to="/pipeline"
              className={navClass}
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <Kanban size={18} className={iconClass} />
              Pipeline
            </NavLink>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-2 py-2 space-y-0.5">
          <NavLink
            to="/settings"
            className={navClass}
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <Settings size={18} className={iconClass} />
            Settings
          </NavLink>
        </div>

        {/* Footer User */}
        <div className="p-2 border-t border-[hsl(var(--sidebar-border))]">
          <button className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] rounded-lg transition-colors group">
            <div className="w-8 h-8 rounded bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-[hsl(var(--sidebar-foreground))] opacity-60">
              <User size={16} />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-[hsl(var(--sidebar-foreground))] truncate">
                Evoc Admin
              </p>
              <p className="text-xs text-[hsl(var(--sidebar-foreground))] opacity-60 truncate">
                evoclabs@gmail.com
              </p>
            </div>
            <LogOut
              size={16}
              className="text-[hsl(var(--sidebar-foreground))] opacity-40 group-hover:opacity-60 transition-opacity"
            />
          </button>
        </div>
      </div>
    </>
  );
};
