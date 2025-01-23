import * as z from "zod";
import { JobStatus, InstallationType, Priority } from "@/types";

export const jobSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  status: z.nativeEnum(JobStatus),
  scheduledDate: z.date().optional(),
  installationType: z.nativeEnum(InstallationType),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    tag: z.enum(["marana", "in-town", "out-of-town", "catalina", "vail"]),
  }),
  teamAssigned: z.string().array().optional(),
  priority: z.nativeEnum(Priority),
  notes: z.string().optional().default(""),
  cost: z.number().min(0, "Cost must be non-negative").optional(),
}).refine((data) => {
  // If status is scheduled, require scheduledDate and teamAssigned
  if (data.status === JobStatus.Scheduled || data.status === JobStatus.ScheduledNextYear) {
    return data.scheduledDate != null && 
           data.teamAssigned != null && 
           data.teamAssigned.length > 0;
  }
  return true;
}, {
  message: "Scheduled date and team assignment are required for scheduled jobs",
  path: ["scheduledDate", "teamAssigned"], // This will show the error on these fields
});

export type JobFormData = z.infer<typeof jobSchema> & { id?: string };