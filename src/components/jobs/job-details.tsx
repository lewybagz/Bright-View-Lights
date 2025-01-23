import { format } from "date-fns";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobStatus, type Job } from "@/types";

interface JobDetailsProps {
  job: Job;
  onEdit: (job: Job) => void;
  onClose: () => void;
}

export function JobDetails({ job, onEdit, onClose }: JobDetailsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Details</h2>
          <p className="text-sm text-muted-foreground">
            Created {format(job.createdAt.toDate(), "PP")}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(job)}>Edit</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Status</h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
    ${
      job.status === JobStatus.Completed
        ? "bg-green-100 text-green-700"
        : job.status === JobStatus.Scheduled
        ? "bg-blue-100 text-blue-700"
        : job.status === JobStatus.ScheduledNextYear
        ? "bg-yellow-100 text-yellow-700"
        : job.status === JobStatus.Quote
        ? "bg-gray-100 text-gray-700"
        : "bg-gray-100 text-gray-700"
    }`}
            >
              {job.status}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">Priority</h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
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
          <div>
            <h3 className="font-semibold">Scheduled Date</h3>
            <p>{format(job.scheduledDate, "PPP")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Customer ID</h3>
            <p>{job.customerId}</p>
          </div>
          <div>
            <h3 className="font-semibold">Installation Type</h3>
            <div className="flex gap-1">
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                {job.installationType}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Location</h3>
          <p>{job.location.address}</p>
          <div className="mt-2 text-sm text-muted-foreground">
            Coordinates: {job.location.coordinates.lat},{" "}
            {job.location.coordinates.lng}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Team Assigned</h3>
          <div className="flex gap-1">
            {job.teamAssigned.map((memberId) => (
              <span
                key={memberId}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs"
              >
                {memberId}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Notes</h3>
          <p className="whitespace-pre-wrap">{job.notes}</p>
        </div>

        <div>
          <h3 className="font-semibold">Last Modified</h3>
          <p>{format(job.lastModified.toDate(), "PPP")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
