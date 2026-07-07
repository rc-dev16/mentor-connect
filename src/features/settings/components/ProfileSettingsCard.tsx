import { User, Phone, Building2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { UserProfile } from "@/data/types/users.types";

type ProfileSettingsCardProps = {
  profile: UserProfile | undefined;
  loadingProfile: boolean;
  formData: {
    phone: string;
    cabin: string;
    availability: string;
  };
  onFormChange: (field: "phone" | "cabin" | "availability", value: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function ProfileSettingsCard({
  profile,
  loadingProfile,
  formData,
  onFormChange,
  onSave,
  isSaving,
}: ProfileSettingsCardProps) {
  return (
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
            {profile?.user_type === "mentor" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => onFormChange("phone", e.target.value)}
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
                    onChange={(e) => onFormChange("cabin", e.target.value)}
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
                    onChange={(e) => onFormChange("availability", e.target.value)}
                    placeholder="Enter your availability (e.g., Mon-Fri 9am-5pm)"
                    rows={3}
                  />
                </div>
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
            {profile?.user_type !== "mentor" && (
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => onFormChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
                <Button onClick={onSave} disabled={isSaving} className="mt-2">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
