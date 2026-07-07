import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/auth/hooks/useAuthSession";
import { useProfile } from "@/data/hooks/useProfile";
import { useUpdateProfile } from "@/data/hooks/mutations/useUpdateProfile";
import { ProfileSettingsCard } from "@/features/settings/components/ProfileSettingsCard";
import { SecuritySettingsCard } from "@/features/settings/components/SecuritySettingsCard";

const SettingsPage = () => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const { session } = useAuthSession(!!userId, userId || undefined);
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({
    phone: "",
    cabin: "",
    availability: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        cabin: profile.cabin || "",
        availability: profile.availability || "",
      });
    }
  }, [profile]);

  const handleFormChange = (field: "phone" | "cabin" | "availability", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileSettingsCard
          profile={profile}
          loadingProfile={loadingProfile}
          formData={formData}
          onFormChange={handleFormChange}
          onSave={handleSave}
          isSaving={updateProfile.isPending}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Email and meeting notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Meeting Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded before meetings</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <SecuritySettingsCard requiresPasswordSetup={!!session?.requiresPasswordSetup} />
      </div>
    </div>
  );
};

export default SettingsPage;
