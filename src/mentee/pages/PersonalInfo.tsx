import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import apiService from "@/services/api";

const PersonalInfo = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>({ name: "", registration_number: "" });
  const [personalInfo, setPersonalInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [userProfile, personalData] = await Promise.all([
          apiService.getUserProfile(),
          apiService.getPersonalInfo().catch(() => ({ message: 'No personal information found' }))
        ]);
        setProfile(userProfile || {});
        setPersonalInfo(personalData.data || personalData || {});
        console.log('Loaded profile:', userProfile);
        console.log('Loaded personalInfo:', personalData.data || personalData);
      } catch (e) {
        setProfile({});
        setPersonalInfo({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        section: formData.get('section') as string || undefined,
        roll_no: formData.get('roll_no') as string || undefined,
        branch: formData.get('branch') as string || undefined,
        blood_group: formData.get('blood_group') as string || undefined,
        hostel_block: formData.get('hostel_block') as string || undefined,
        room_no: formData.get('room_no') as string || undefined,
        date_of_birth: formData.get('date_of_birth') as string || undefined,
        has_muj_alumni: formData.get('has_muj_alumni') === 'true',
        alumni_details: formData.get('alumni_details') as string || undefined,
        father_name: formData.get('father_name') as string || undefined,
        father_mobile: formData.get('father_mobile') as string || undefined,
        father_email: formData.get('father_email') as string || undefined,
        father_occupation: formData.get('father_occupation') as string || undefined,
        father_organization: formData.get('father_organization') as string || undefined,
        father_designation: formData.get('father_designation') as string || undefined,
        mother_name: formData.get('mother_name') as string || undefined,
        mother_mobile: formData.get('mother_mobile') as string || undefined,
        mother_email: formData.get('mother_email') as string || undefined,
        mother_occupation: formData.get('mother_occupation') as string || undefined,
        mother_organization: formData.get('mother_organization') as string || undefined,
        mother_designation: formData.get('mother_designation') as string || undefined,
        communication_address: formData.get('communication_address') as string || undefined,
        communication_pincode: formData.get('communication_pincode') as string || undefined,
        permanent_address: formData.get('permanent_address') as string || undefined,
        permanent_pincode: formData.get('permanent_pincode') as string || undefined,
        business_card_url: formData.get('business_card_url') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        email: formData.get('email') as string || undefined
      };

      console.log('Form data being sent:', data);
      console.log('Phone being sent:', data.phone);
      console.log('Email being sent:', data.email);

      await apiService.savePersonalInfo(data);
      
      toast({
        title: "Success",
        description: "Personal information saved successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save personal information",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Personal Information</h1>
        <p className="text-muted-foreground mt-2">Manage your personal and family details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your full name" value={profile.name || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNo">Registration No.</Label>
                <Input id="regNo" placeholder="Enter registration number" value={profile.registration_number || ""} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input id="section" name="section" placeholder="Enter section" defaultValue={personalInfo.section || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll_no">Roll No.</Label>
                <Input id="roll_no" name="roll_no" placeholder="Enter roll number" defaultValue={personalInfo.roll_no || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" name="branch" placeholder="Enter your branch" defaultValue={personalInfo.branch || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile No.</Label>
                <Input id="mobile" name="phone" placeholder="Enter mobile number" type="tel" defaultValue={profile.phone || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Id</Label>
                <Input id="email" name="email" placeholder="Enter email address" type="email" defaultValue={profile.email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Input id="blood_group" name="blood_group" placeholder="Enter blood group" defaultValue={personalInfo.blood_group || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostel_block">Hostel Block No.</Label>
                <Input id="hostel_block" name="hostel_block" placeholder="Enter hostel block number" defaultValue={personalInfo.hostel_block || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_no">Room No.</Label>
                <Input id="room_no" name="room_no" placeholder="Enter room number" defaultValue={personalInfo.room_no || ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={personalInfo.date_of_birth || ""} />
            </div>
          </CardContent>
        </Card>

        {/* MUJ Alumni Information */}
        <Card>
          <CardHeader>
            <CardTitle>MUJ Alumni Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Any MUJ alumni in your family?</Label>
              <RadioGroup defaultValue="no" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="alumni-yes" />
                  <Label htmlFor="alumni-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="alumni-no" />
                  <Label htmlFor="alumni-no">No</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alumniDetails">If Yes, please give their names, branch, batch, institution and relationship</Label>
              <Textarea id="alumniDetails" placeholder="Enter alumni details" />
            </div>
          </CardContent>
        </Card>

        {/* Parents Information */}
        <Card>
          <CardHeader>
            <CardTitle>Parents Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Father's Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Father's Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input id="fatherName" name="father_name" placeholder="Enter father's name" defaultValue={personalInfo.father_name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherMobile">Mobile No.</Label>
                  <Input id="fatherMobile" name="father_mobile" placeholder="Enter mobile number" type="tel" defaultValue={personalInfo.father_mobile || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherEmail">E-mail Id</Label>
                <Input id="fatherEmail" name="father_email" placeholder="Enter email address" type="email" defaultValue={personalInfo.father_email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_occupation">Occupation</Label>
                <Input id="father_occupation" name="father_occupation" placeholder="Enter father's occupation" defaultValue={personalInfo.father_occupation || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherOrg">Organization</Label>
                <Input id="fatherOrg" name="father_organization" placeholder="Enter organization name" defaultValue={personalInfo.father_organization || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_designation">Designation</Label>
                <Input id="father_designation" name="father_designation" placeholder="Enter designation" defaultValue={personalInfo.father_designation || ""} />
              </div>
            </div>

            {/* Mother's Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Mother's Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input id="motherName" name="mother_name" placeholder="Enter mother's name" defaultValue={personalInfo.mother_name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherMobile">Mobile No.</Label>
                  <Input id="motherMobile" name="mother_mobile" placeholder="Enter mobile number" type="tel" defaultValue={personalInfo.mother_mobile || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherEmail">E-mail Id</Label>
                <Input id="motherEmail" name="mother_email" placeholder="Enter email address" type="email" defaultValue={personalInfo.mother_email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mother_occupation">Occupation</Label>
                <Input id="mother_occupation" name="mother_occupation" placeholder="Enter mother's occupation" defaultValue={personalInfo.mother_occupation || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherOrg">Organization</Label>
                <Input id="motherOrg" name="mother_organization" placeholder="Enter organization name" defaultValue={personalInfo.mother_organization || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mother_designation">Designation</Label>
                <Input id="mother_designation" name="mother_designation" placeholder="Enter designation" defaultValue={personalInfo.mother_designation || ""} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Communication Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Address for Communication</h3>
              <div className="space-y-2">
                <Label htmlFor="commAddress">Address</Label>
                <Textarea id="commAddress" name="communication_address" placeholder="Enter communication address" defaultValue={personalInfo.communication_address || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commPincode">Pin Code</Label>
                <Input id="commPincode" name="communication_pincode" placeholder="Enter pin code" defaultValue={personalInfo.communication_pincode || ""} />
              </div>
            </div>

            {/* Permanent Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Permanent Address</h3>
              <div className="space-y-2">
                <Label htmlFor="permAddress">Address</Label>
                <Textarea id="permAddress" name="permanent_address" placeholder="Enter permanent address" defaultValue={personalInfo.permanent_address || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permPincode">Pin Code</Label>
                <Input id="permPincode" name="permanent_pincode" placeholder="Enter pin code" defaultValue={personalInfo.permanent_pincode || ""} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Card Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Parent's Business Card (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_card_url">Business Card URL</Label>
              <Input 
                id="business_card_url" 
                name="business_card_url" 
                type="url" 
                placeholder="Enter business card URL (optional)" 
                defaultValue={personalInfo.business_card_url || ""} 
              />
              <p className="text-sm text-muted-foreground">
                Upload your parent's business card to a file sharing service and paste the URL here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving..." : "Save Information"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;
