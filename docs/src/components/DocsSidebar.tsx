import { useState, useCallback, useEffect } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { navStructure, type NavItem } from "@/data/docSections";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocsSidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

const SidebarItem = ({
  item,
  activeSection,
  onNavigate,
  depth = 0,
}: {
  item: NavItem;
  activeSection: string;
  onNavigate: (id: string) => void;
  depth?: number;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeSection === item.id;
  const isChildActive = hasChildren && item.children!.some((c) => c.id === activeSection);
  const [expanded, setExpanded] = useState(isChildActive || isActive);

  useEffect(() => {
    if (isChildActive) setExpanded(true);
  }, [isChildActive]);

  return (
    <div>
      <button
        onClick={() => {
          onNavigate(item.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-secondary"
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {hasChildren && (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        )}
        <span className="truncate">{item.title}</span>
      </button>
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              activeSection={activeSection}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DocsSidebar = ({ activeSection, onNavigate }: DocsSidebarProps) => {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = useCallback(
    (id: string) => {
      onNavigate(id);
      if (isMobile) setMobileOpen(false);
    },
    [onNavigate, isMobile]
  );

  const sidebarContent = (
    <nav className="space-y-0.5 py-4" aria-label="Documentation navigation">
      {navStructure.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      ))}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-primary shadow-lg"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5 text-primary-foreground" />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
                <span className="font-semibold text-sm text-foreground">Navigation</span>
                <button onClick={() => setMobileOpen(false)} className="p-1">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <aside className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar h-[calc(100vh-var(--nav-height))] sticky top-[var(--nav-height)] overflow-y-auto">
      {sidebarContent}
    </aside>
  );
};

export default DocsSidebar;
