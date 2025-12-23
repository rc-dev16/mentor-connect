import { useEffect, useState } from "react";

import { User, Bell, Lock, Phone, Building2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/services/api";
import { useClerk } from "@clerk/clerk-react";

const Settings = () => {
  const { toast } = useToast();
  const { openUserProfile } = useClerk();
  const [profile, setProfile] = useState<{ 
    name: string; 
    email: string; 
    phone?: string; 
    cabin?: string; 
    availability?: string;
    user_type?: string;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    cabin: "",
    availability: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getUserProfile();
        setProfile(data);
        setFormData({
          phone: data.phone || "",
          cabin: data.cabin || "",
          availability: data.availability || "",
        });
      } catch (e) {
        setProfile({ name: "", email: "" });
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await apiService.updateUserProfile(formData);
      setProfile(updated);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your profile from the database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingProfile ? (
              <div className="h-16 flex items-center text-sm text-muted-foreground">Loading profile...</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={profile?.name || ""} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile?.email || ""} readOnly />
                </div>
                <Separator />
                {profile?.user_type === 'mentor' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cabin" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Cabin
                      </Label>
                      <Input 
                        id="cabin" 
                        value={formData.cabin} 
                        onChange={(e) => setFormData({ ...formData, cabin: e.target.value })}
                        placeholder="Enter your cabin number/location"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="availability" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Availability
                      </Label>
                      <Textarea 
                        id="availability" 
                        value={formData.availability} 
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="Enter your availability (e.g., Mon-Fri 9am-5pm)"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
                {profile?.user_type !== 'mentor' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                    <Button onClick={handleSave} disabled={saving} className="mt-2">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
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

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in with your email OTP, then set a password once you are logged in.
            </p>
            <Button onClick={() => openUserProfile?.({})}>
              Open account &amp; password settings
            </Button>
            <p className="text-xs text-muted-foreground">
              This opens Clerk’s secure account portal so you can set or rotate your password after your first OTP login.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
