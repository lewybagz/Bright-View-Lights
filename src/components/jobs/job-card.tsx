// First, let's create an enhanced version of JobCard for detailed view
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobStatus, Team, type Job } from "@/types";
import {
  MapPin,
  User,
  Settings,
  X,
  Calendar,
  Wrench,
  Phone,
  Clipboard,
  Users,
} from "lucide-react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

interface JobViewProps {
  job: Job;
  onEdit: (job: Job) => void;
  onClose: () => void;
  onView: (job: Job) => void;
}

export function EnhancedJobView({ job, onEdit, onClose }: JobViewProps) {
  const [teams, setTeams] = useState<Team[]>([]);

  const getFormattedDate = (date: string | number | Date | Timestamp) => {
    if (!date) return "No date scheduled";

    const dateObj =
      date instanceof Timestamp
        ? new Date(date.seconds * 1000 + date.nanoseconds / 1000000)
        : new Date(date);

    return `${format(dateObj, "EEEE, MMMM d, yyyy")} at ${format(
      dateObj,
      "h:mm aa"
    )}`;
  };

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsRef = collection(db, "teams");
      const snapshot = await getDocs(teamsRef);
      setTeams(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Team))
      );
    };
    fetchTeams();
  }, []);

  return (
    <Card className="overflow-hidden">
      {/* Header with close button */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Job Details</h2>
            <p className="text-sm text-muted-foreground">
              Created on {getFormattedDate(job.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(job)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content with extended details */}
      <div className="p-6 space-y-6">
        {/* Status and Priority Section */}
        <div className="flex gap-4 items-center">
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
              ${
                job.status === JobStatus.Completed
                  ? "bg-green-100 text-green-700 border-green-200"
                  : job.status === JobStatus.Scheduled
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : job.status === JobStatus.ScheduledNextYear
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {job.status}
            </span>
          </div>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
              ${
                job.priority === "urgent"
                  ? "bg-red-100 text-red-700"
                  : job.priority === "high"
                  ? "bg-orange-100 text-orange-700"
                  : job.priority === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {job.priority}
            </span>
          </div>
        </div>

        {/* Customer and Installation Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col justify-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Who?</span>
                </div>
                <p className="font-medium">{job.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${job.customerPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {job.customerPhone}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span>What?</span>
              </div>
              <p className="font-medium">
                {job.installationType.charAt(0).toUpperCase() +
                  job.installationType.slice(1).toLowerCase()}{" "}
                Lighting
              </p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Who's Doing It?</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.teamAssigned.map((teamId) => {
                const team = teams.find((t) => t.id === teamId);
                return (
                  <span
                    key={teamId}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {team?.name || teamId}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>When?</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium">
                  {getFormattedDate(job.scheduledDate).split(" at ")[0]}
                </p>
                <p className="text-muted-foreground">
                  {getFormattedDate(job.scheduledDate).split(" at ")[1]}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Where?</span>
              </div>
              <p className="font-medium">{job.location.address}</p>
              <p className="text-sm text-muted-foreground">
                {job.location.tag}
              </p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {job.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clipboard className="h-4 w-4" />
              <span>Notes</span>
            </div>
            <p className="text-sm whitespace-pre-wrap rounded-lg bg-muted p-4 font-medium">
              {job.notes}
            </p>
          </div>
        )}

        {/* Last Modified */}
        <p className="text-sm text-muted-foreground">
          Last modified: {getFormattedDate(job.lastModified)}
        </p>
      </div>
    </Card>
  );
}
