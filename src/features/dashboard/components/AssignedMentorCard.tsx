import { Building2, Clock, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssignedMentor {
  name: string;
  email: string;
  phone: string;
  cabin: string;
  availability: string;
}

interface AssignedMentorCardProps {
  mentor: AssignedMentor;
}

export const AssignedMentorCard = ({ mentor }: AssignedMentorCardProps) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="text-xl">Your Mentor</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <h3 className="text-lg font-semibold">{mentor.name || "—"}</h3>
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <span className="text-base">{mentor.email || "—"}</span>
        </div>
        {mentor.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-base">{mentor.phone}</span>
          </div>
        )}
        {mentor.cabin && (
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-base">Cabin: {mentor.cabin}</span>
          </div>
        )}
        {mentor.availability && (
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-base">Available: {mentor.availability}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
