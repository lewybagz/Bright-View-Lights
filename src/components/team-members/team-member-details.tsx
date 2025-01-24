// components/team-members/team-member-details.tsx
import { format } from "date-fns";
import { X } from "lucide-react";
import { TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMemberDetailsProps {
  member: TeamMember;
  onClose: () => void;
}

export function TeamMemberDetails({ member, onClose }: TeamMemberDetailsProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{member.name}</h2>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-1">Role</h3>
            <Badge variant="secondary">{member.role}</Badge>
          </div>

          <div>
            <h3 className="font-medium mb-1">Status</h3>
            <Badge
              variant={member.status === "active" ? "default" : "destructive"}
            >
              {member.status}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium mb-1">Phone</h3>
            <p>{member.phoneNumber}</p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Hire Date</h3>
            <p>{format(member.hireDate, "PPP")}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Emergency Contact</h3>
          <div className="space-y-1">
            <p>{member.emergencyContact.name}</p>
            <p>{member.emergencyContact.phoneNumber}</p>
            <p className="text-sm text-muted-foreground">
              {member.emergencyContact.relationship}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
