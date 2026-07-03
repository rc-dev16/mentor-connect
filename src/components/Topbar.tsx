import { User, Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/react";
import { signOutWithClerk } from "@/auth/services/sign-out";
import { useProfile } from "@/data/hooks/useProfile";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const { data: profile } = useProfile();

  const studentInfo = {
    name: profile?.name || "",
    regNo: profile?.registration_number || "",
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 shadow-sm">
      <div className="flex items-center h-full px-4 gap-4">
        {/* Left: Menu Button and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MC</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">Mentor-Connect</span>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{studentInfo.name || "Student"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{studentInfo.name || "Student"}</span>
                  {studentInfo.regNo && (
                    <span className="text-xs text-muted-foreground font-normal">
                      Reg: {studentInfo.regNo}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOutWithClerk(signOut, userId || undefined)}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
