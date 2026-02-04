import { Home, Calendar, Settings, X, PanelLeftClose, PanelLeftOpen, Users, UserCircle, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Meetings", path: "/meetings" },
  { icon: Users, label: "Mentorship Connect", path: "/mentorship-connect" },
  { icon: UserCircle, label: "Personal Info", path: "/personal-info" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar text-sidebar-foreground transition-all duration-300 z-40 shadow-lg",
          "lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end p-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4 pb-16">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                onClose();
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle button (desktop only) */}
        <div className="hidden lg:flex justify-center items-center absolute bottom-4 left-0 right-0 mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent rounded-full bg-sidebar shadow-md border border-border"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
