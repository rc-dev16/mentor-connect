import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, Phone, Calendar, User, GraduationCap } from "lucide-react";
import { apiService } from "@/services/api";
import MenteeProfileDialog from "../components/MenteeProfileDialog";

interface Mentee {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  department: string;
  phone: string | null;
  bio: string | null;
  mentorship_status: string;
  has_personal_info?: boolean;
}

const MenteesPage = () => {
  const { toast } = useToast();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [filteredMentees, setFilteredMentees] = useState<Mentee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);

  // Load mentees from API
  useEffect(() => {
    const loadMentees = async () => {
      try {
        setIsLoading(true);
        const menteesData = await apiService.getMentees();
        setMentees(menteesData);
        setFilteredMentees(menteesData);
      } catch (error) {
        console.error('Error loading mentees:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load mentees data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMentees();
  }, [toast]);

  // Filter mentees based on search term
  useEffect(() => {
    const filtered = mentees.filter(mentee =>
      mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentee.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentee.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMentees(filtered);
  }, [searchTerm, mentees]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewProfile = (menteeId: string) => {
    setSelectedMenteeId(menteeId);
    setIsProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileDialogOpen(false);
    setSelectedMenteeId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading mentees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Mentees</h1>
          <p className="text-muted-foreground">
            Manage and track your assigned mentees
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {mentees.length} Total Mentees
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search mentees by name, registration number, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mentees Grid */}
      {filteredMentees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No mentees found' : 'No mentees assigned'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'You don\'t have any mentees assigned yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentees.map((mentee) => (
            <Card key={mentee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{mentee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {mentee.registration_number}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Department + Personal Info Status */}
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex items-center gap-2">
                    {mentee.department}
                    {typeof mentee.has_personal_info !== 'undefined' && (
                      mentee.has_personal_info ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                          Personal info added
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs">
                          No personal info
                        </span>
                      )
                    )}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {mentee.email}
                  </span>
                </div>

                {/* Phone */}
                {mentee.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {mentee.phone}
                    </span>
                  </div>
                )}

                {/* Start date removed per requirements */}

                {/* Bio */}
                {mentee.bio && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mentee.bio}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewProfile(mentee.id)}
                  >
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats removed per requirements */}

      {/* Profile Dialog */}
      <MenteeProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={handleCloseProfile}
        menteeId={selectedMenteeId}
      />
    </div>
  );
};

export default MenteesPage;
