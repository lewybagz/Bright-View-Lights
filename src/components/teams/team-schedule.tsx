import { format } from "date-fns";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Team, Schedule } from "@/types";
import { Timestamp } from "firebase/firestore";

interface TeamScheduleProps {
  team: Team;
  schedule: Schedule;
}

export function TeamSchedule({ team, schedule }: TeamScheduleProps) {
  const scheduleDate =
    schedule.date instanceof Timestamp
      ? schedule.date.toDate()
      : schedule.date instanceof Date
      ? schedule.date
      : new Date();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Team Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Week of {format(scheduleDate, "PP")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.jobs.map((jobId) => (
            <div
              key={jobId}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <div className="font-medium">Job #{jobId}</div>
                <div className="text-sm text-muted-foreground">
                  Assigned team: {team.members.map((m) => m.name).join(", ")}
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium
                ${
                  schedule.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : schedule.status === "active"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {schedule.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
