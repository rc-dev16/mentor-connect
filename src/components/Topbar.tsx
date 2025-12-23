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
import { useEffect, useState } from "react";
import apiService from "@/services/api";
import { useAuth } from "@clerk/clerk-react";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [studentInfo, setStudentInfo] = useState<{ name: string; regNo: string }>({ name: "", regNo: "" });
  useEffect(() => {
    const load = async () => {
      try {
        const p = await apiService.getUserProfile();
        setStudentInfo({ name: p?.name || "", regNo: p?.registration_number || "" });
      } catch {}
    };
    load();
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 shadow-sm">
      <div className="flex items-center h-full px-4 gap-4">
        {/* Left: Menu Button and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain" />
        </div>

        {/* Center: Heading */}
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-primary whitespace-nowrap uppercase">
            Mentor-Connect
          </h1>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 w-auto max-w-[320px] md:max-w-[420px]">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="hidden md:block text-left flex-1">
                  <p className="text-sm font-medium leading-snug whitespace-normal break-words">{studentInfo.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-normal break-words">{studentInfo.regNo}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/personal-info")} className="gap-2">
                <User className="h-4 w-4" />
                Personal Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-red-600"
                onClick={async () => {
                  try {
                    sessionStorage.removeItem('userType');
                    await signOut?.({ redirectUrl: '/login' });
                  } catch {
                    navigate('/login');
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
