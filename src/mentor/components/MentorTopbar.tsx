import { useState, useEffect } from "react";
import { User, Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";

interface MentorTopbarProps {
  onMenuClick: () => void;
}

const MentorTopbar = ({ onMenuClick }: MentorTopbarProps) => {
  const navigate = useNavigate();
  const [mentorInfo, setMentorInfo] = useState({
    name: "Loading...",
    email: "Loading..."
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMentorInfo = async () => {
      try {
        const profile = await apiService.getUserProfile();
        setMentorInfo({
          name: profile.name,
          email: profile.email
        });
      } catch (error) {
        console.error('Error loading mentor profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMentorInfo();
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
          <h1 className="text-2xl font-black text-primary whitespace-nowrap uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Mentor-Connect
          </h1>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 w-auto max-w-sm">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary opacity-100" />
                </div>
                <div className="hidden sm:block text-left flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{mentorInfo.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-72">
                    {mentorInfo.email}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => navigate("/mentor/settings")} className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/login")} className="gap-2 text-red-600">
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

export default MentorTopbar;
