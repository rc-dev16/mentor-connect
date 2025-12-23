import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  MapPin, 
  Users, 
  Building,
  FileText,
  Loader2,
  Download
} from "lucide-react";
import { apiService } from "@/services/api";

interface MenteeProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menteeId: string | null;
}

interface PersonalInfo {
  section?: string;
  roll_no?: string;
  branch?: string;
  blood_group?: string;
  hostel_block?: string;
  room_no?: string;
  date_of_birth?: string;
  has_muj_alumni?: boolean;
  alumni_details?: string;
  father_name?: string;
  father_mobile?: string;
  father_email?: string;
  father_occupation?: string;
  father_organization?: string;
  father_designation?: string;
  mother_name?: string;
  mother_mobile?: string;
  mother_email?: string;
  mother_occupation?: string;
  mother_organization?: string;
  mother_designation?: string;
  communication_address?: string;
  communication_pincode?: string;
  permanent_address?: string;
  permanent_pincode?: string;
  business_card_url?: string;
}

interface MenteeProfile {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  department: string;
  phone: string | null;
  bio: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  personal_info: PersonalInfo;
}

const MenteeProfileDialog = ({ isOpen, onClose, menteeId }: MenteeProfileDialogProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    if (isOpen && menteeId) {
      loadProfile();
    }
  }, [isOpen, menteeId]);

  const loadProfile = async () => {
    if (!menteeId) return;
    
    try {
      setIsLoading(true);
      const profileData = await apiService.getMenteeProfile(menteeId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load mentee profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = async () => {
    if (!menteeId) return;

    try {
      setIsDownloadingPDF(true);
      const blob = await apiService.downloadMenteePersonalInfoPDF(menteeId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mentee_personal_info_${profile?.registration_number || menteeId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Personal information PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download PDF. Please try again.",
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const hasPersonalInfo = profile?.personal_info && profile.personal_info !== null;
  

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
            {/* Basic Information */}
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
                      {profile.phone || 'Not provided'}
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

            {/* Personal Information */}
            {hasPersonalInfo ? (
              <>
                {/* Academic Information */}
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
                        <p className="text-sm">{profile.personal_info.section || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                        <p className="text-sm">{profile.personal_info.roll_no || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Branch</label>
                        <p className="text-sm">{profile.personal_info.branch || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                        <p className="text-sm">{profile.personal_info.blood_group || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-sm">
                          {profile.personal_info.date_of_birth 
                            ? formatDate(profile.personal_info.date_of_birth)
                            : 'Not provided'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Hostel Details</label>
                        <p className="text-sm">
                          {profile.personal_info.hostel_block && profile.personal_info.room_no
                            ? `Block ${profile.personal_info.hostel_block}, Room ${profile.personal_info.room_no}`
                            : 'Not provided'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Family Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Family Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Father's Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Father's Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{profile.personal_info.father_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                          <p className="text-sm">{profile.personal_info.father_mobile || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{profile.personal_info.father_email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                          <p className="text-sm">{profile.personal_info.father_occupation || 'Not provided'}</p>
                        </div>
                      </div>
                      {(profile.personal_info.father_organization || profile.personal_info.father_designation) && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Organization & Designation</label>
                          <p className="text-sm">
                            {[profile.personal_info.father_organization, profile.personal_info.father_designation]
                              .filter(Boolean)
                              .join(' - ') || 'Not provided'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mother's Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Mother's Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{profile.personal_info.mother_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                          <p className="text-sm">{profile.personal_info.mother_mobile || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{profile.personal_info.mother_email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                          <p className="text-sm">{profile.personal_info.mother_occupation || 'Not provided'}</p>
                        </div>
                      </div>
                      {(profile.personal_info.mother_organization || profile.personal_info.mother_designation) && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Organization & Designation</label>
                          <p className="text-sm">
                            {[profile.personal_info.mother_organization, profile.personal_info.mother_designation]
                              .filter(Boolean)
                              .join(' - ') || 'Not provided'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* MUJ Alumni Information */}
                    {profile.personal_info.has_muj_alumni && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">MUJ Alumni Information</h4>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Alumni Details</label>
                          <p className="text-sm">{profile.personal_info.alumni_details || 'Not provided'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Communication Address */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Communication Address</h4>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm">{profile.personal_info.communication_address || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
                        <p className="text-sm">{profile.personal_info.communication_pincode || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Permanent Address</h4>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm">{profile.personal_info.permanent_address || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
                        <p className="text-sm">{profile.personal_info.permanent_pincode || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Card */}
                {profile.personal_info.business_card_url && (
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
                          href={profile.personal_info.business_card_url} 
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

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={loadProfile} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh"}
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
                <Button>
                  Send Message
                </Button>
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
