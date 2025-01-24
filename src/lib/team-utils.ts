// utils/team-utils.ts
import type { TeamMember } from "@/types";

export function getTeamSkills(members: TeamMember[]): string[] {
  const allSkills = members.flatMap(member => member.skills);
  return [...new Set(allSkills)];
}