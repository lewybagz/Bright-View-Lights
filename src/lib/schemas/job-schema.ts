import * as z from "zod";
import { JobStatus, InstallationType, Priority } from "@/types";

export const jobSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  status: z.nativeEnum(JobStatus),
  scheduledDate: z.date(),
  installationType: z.nativeEnum(InstallationType),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    tag: z.enum(["marana", "in-town", "out-of-town", "catalina", "vail"]),
  }),
  teamAssigned: z.string().array(),
  priority: z.nativeEnum(Priority),
  notes: z.string(),
  cost: z.number().min(0, "Cost must be non-negative"),
});

export type JobFormData = z.infer<typeof jobSchema> & { id?: string };