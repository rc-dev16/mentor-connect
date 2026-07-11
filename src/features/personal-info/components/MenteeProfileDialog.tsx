import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDownloadMenteePdf } from "@/data/hooks/useDownloads";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Users,
  FileText,
  Loader2,
  Download,
} from "lucide-react";
import { useMenteeProfile } from "@/data/hooks/usePersonalInfo";

interface MenteeProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menteeId: string | null;
}

const MenteeProfileDialog = ({ isOpen, onClose, menteeId }: MenteeProfileDialogProps) => {
  const { toast } = useToast();
  const {
    data: profileData,
    isLoading,
    isFetching,
    refetch,
  } = useMenteeProfile(isOpen ? menteeId ?? undefined : undefined);
  const downloadMenteePdf = useDownloadMenteePdf();
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const profile = profileData;
  const personalInfo = profile?.personal_info ?? null;
  const hasPersonalInfo = Boolean(personalInfo);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadPDF = async () => {
    if (!menteeId) return;

    try {
      setIsDownloadingPDF(true);
      await downloadMenteePdf.mutateAsync({
        menteeId,
        registrationNumber: profile?.registration_number,
      });

      toast({
        title: "PDF Downloaded",
        description: "Personal information PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download PDF. Please try again.",
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mentee Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading profile...</p>
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                    <p className="text-sm">{profile.registration_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mobile No.</label>
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {profile.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-sm flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {profile.department}
                    </p>
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasPersonalInfo ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Section</label>
                        <p className="text-sm">{personalInfo.section || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                        <p className="text-sm">{personalInfo.roll_no || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Branch</label>
                        <p className="text-sm">{personalInfo.branch || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                        <p className="text-sm">{personalInfo.blood_group || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-sm">
                          {personalInfo.date_of_birth
                            ? formatDate(personalInfo.date_of_birth)
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Hostel Details</label>
                        <p className="text-sm">
                          {personalInfo.hostel_block && personalInfo.room_no
                            ? `Block ${personalInfo.hostel_block}, Room ${personalInfo.room_no}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Family Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Father's Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{personalInfo.father_name || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                          <p className="text-sm">{personalInfo.father_mobile || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{personalInfo.father_email || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                          <p className="text-sm">{personalInfo.father_occupation || "Not provided"}</p>
                        </div>
                      </div>
                      {(personalInfo.father_organization || personalInfo.father_designation) && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Organization & Designation</label>
                          <p className="text-sm">
                            {[personalInfo.father_organization, personalInfo.father_designation]
                              .filter(Boolean)
                              .join(" - ") || "Not provided"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Mother's Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{personalInfo.mother_name || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                          <p className="text-sm">{personalInfo.mother_mobile || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{personalInfo.mother_email || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                          <p className="text-sm">{personalInfo.mother_occupation || "Not provided"}</p>
                        </div>
                      </div>
                      {(personalInfo.mother_organization || personalInfo.mother_designation) && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Organization & Designation</label>
                          <p className="text-sm">
                            {[personalInfo.mother_organization, personalInfo.mother_designation]
                              .filter(Boolean)
                              .join(" - ") || "Not provided"}
                          </p>
                        </div>
                      )}
                    </div>

                    {personalInfo.has_muj_alumni && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">MUJ Alumni Information</h4>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Alumni Details</label>
                          <p className="text-sm">{personalInfo.alumni_details || "Not provided"}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Communication Address</h4>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm">{personalInfo.communication_address || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
                        <p className="text-sm">{personalInfo.communication_pincode || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Permanent Address</h4>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm">{personalInfo.permanent_address || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
                        <p className="text-sm">{personalInfo.permanent_pincode || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {personalInfo.business_card_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Business Card
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={personalInfo.business_card_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Business Card
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Personal Information</h3>
                  <p className="text-muted-foreground">
                    This mentee hasn't filled out their personal information yet.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>
              <div className="flex gap-2">
                {hasPersonalInfo && (
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloadingPDF ? "Downloading..." : "Download PDF"}
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button>Send Message</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">No profile data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MenteeProfileDialog;
