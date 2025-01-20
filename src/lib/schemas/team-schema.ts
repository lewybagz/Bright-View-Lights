// src/lib/schemas/team-schema.ts
import * as z from "zod";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "installer", "office"] as const),
  skills: z.array(z.string()),
});

export const teamSchema = z.object({
  members: z.array(teamMemberSchema).min(1, "At least one member is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});