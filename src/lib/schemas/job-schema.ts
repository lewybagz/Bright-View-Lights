import * as z from "zod";
import { JobStatus, InstallationType, Priority } from "@/types";
import { LOCATION_TAGS } from "@/lib/regions";
import { Timestamp } from 'firebase/firestore';

// First, let's create a custom Zod schema for Firestore Timestamp
const timestampSchema = z.custom<Timestamp>((val) => {
  return val instanceof Timestamp;
}).or(z.date().transform(date => Timestamp.fromDate(date))); // Allows Date input, converts to Timestamp

export const jobSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(100, "Customer name is too long"),
  customerPhone: z.string().optional(),
  
  status: z.nativeEnum(JobStatus),
  // Keep scheduledDate as Date since it's used in forms and UI
  scheduledDate: z.date().optional(),
  installationType: z.nativeEnum(InstallationType),
  
  location: z.object({
    address: z.string().min(1, "Address is required"),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    tag: z.enum(LOCATION_TAGS),
  }),
  
  teamAssigned: z.string().array().optional(),
  priority: z.nativeEnum(Priority),
  notes: z.string().optional().default(""),
  cost: z.number().min(0, "Cost must be non-negative").optional(),
  
  // Add Timestamp fields - they'll be automatically added when saving to Firestore
  createdAt: timestampSchema.optional(), // Optional in the form since it's set server-side
  lastModified: timestampSchema.optional(), // Optional in the form since it's set server-side
}).refine((data) => {
  if (data.status === JobStatus.Scheduled || data.status === JobStatus.ScheduledNextYear) {
    return data.scheduledDate != null && 
           data.teamAssigned != null && 
           data.teamAssigned.length > 0;
  }
  return true;
}, {
  message: "Scheduled date and team assignment are required for scheduled jobs",
  path: ["scheduledDate", "teamAssigned"],
});

export type JobFormData = z.infer<typeof jobSchema> & { id?: string };