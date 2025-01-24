// team-card.tsx
import { useState } from "react";
import { format } from "date-fns";
import { Edit, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Team } from "@/types";
import { Timestamp } from "firebase/firestore";

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
}

export function TeamCard({ team, onEdit }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatFirestoreDate = (date: Date | Timestamp | string) => {
    try {
      // If it's a Firestore Timestamp
      if (date instanceof Timestamp) {
        return format(date.toDate(), "PP");
      }
      // If it's a string, convert to Date
      if (typeof date === "string") {
        return format(new Date(date), "PP");
      }
      // If it's already a Date object
      if (date instanceof Date) {
        return format(date, "PP");
      }
      return "Invalid date";
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Team {team.id}</h3>
          <p className="text-sm text-muted-foreground">
            {team.members.length} Members
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(team)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Members:</h4>
            {team.members.map((member) => (
              <div key={member.id} className="text-sm">
                {member.name} ({member.role})
              </div>
            ))}
          </div>

          {expanded && (
            <>
              <div>
                <h4 className="font-medium mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {team.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {team.currentJob && (
                <div>
                  <h4 className="font-medium mb-2">Current Job:</h4>
                  <div className="text-sm">
                    Job #{team.currentJob.id}
                    <br />
                    {team.currentJob.location.address}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Contact Information:</h4>
                {team.members.map((member) => (
                  <div key={member.id} className="text-sm mb-2">
                    <div className="font-medium">{member.name}</div>
                    <div>{member.email}</div>
                    <div>{member.phoneNumber}</div>
                    <div>Hired: {formatFirestoreDate(member.hireDate)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
