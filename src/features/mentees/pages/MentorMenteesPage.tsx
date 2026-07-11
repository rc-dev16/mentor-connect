import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDownloadMenteesCsv } from "@/data/hooks/useDownloads";
import { Search, Mail, Phone, User, GraduationCap, Download } from "lucide-react";
import { useMentees } from "@/data/hooks/useProfile";
import MenteeProfileDialog from "@/features/personal-info/components/MenteeProfileDialog";

const MentorMenteesPage = () => {
  const { toast } = useToast();
  const { data: mentees = [], isLoading } = useMentees();
  const downloadMenteesCsv = useDownloadMenteesCsv();
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredMentees = useMemo(() => {
    if (!searchTerm) return mentees;
    const term = searchTerm.toLowerCase();
    return mentees.filter(
      (mentee) =>
        mentee.name.toLowerCase().includes(term) ||
        mentee.registration_number.toLowerCase().includes(term) ||
        mentee.email.toLowerCase().includes(term) ||
        mentee.department.toLowerCase().includes(term)
    );
  }, [searchTerm, mentees]);

  const handleViewProfile = (menteeId: string) => {
    setSelectedMenteeId(menteeId);
    setIsProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileDialogOpen(false);
    setSelectedMenteeId(null);
  };

  const handleDownloadMenteesInfo = async () => {
    try {
      setIsDownloading(true);
      await downloadMenteesCsv.mutateAsync();

      toast({
        title: "Download Successful",
        description: `Personal information for ${mentees.length} mentee(s) has been downloaded.`,
      });
    } catch (error) {
      console.error("Error downloading mentees data:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download mentees data. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
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
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {typedMentees.length} Total Mentees
          </Badge>
          {typedMentees.length > 0 && (
            <Button
              onClick={handleDownloadMenteesInfo}
              disabled={isDownloading}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Personal Info"}
            </Button>
          )}
        </div>
      </div>

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

      {filteredMentees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No mentees found" : "No mentees assigned"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search terms"
                : "You don't have any mentees assigned yet"}
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
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex items-center gap-2">
                    {mentee.department}
                    {typeof mentee.has_personal_info !== "undefined" &&
                      (mentee.has_personal_info ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                          Personal info added
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs">
                          No personal info
                        </span>
                      ))}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {mentee.email}
                  </span>
                </div>

                {mentee.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {mentee.phone}
                    </span>
                  </div>
                )}

                {mentee.bio && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mentee.bio}
                    </p>
                  </div>
                )}

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

      <MenteeProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={handleCloseProfile}
        menteeId={selectedMenteeId}
      />
    </div>
  );
};

export default MentorMenteesPage;
