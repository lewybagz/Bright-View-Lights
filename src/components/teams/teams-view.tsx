import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TeamForm } from "./team-form";
import { TeamSchedule } from "./team-schedule";
import { TeamMetrics } from "./team-metrics";
import type { Team } from "@/types";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import * as z from "zod";
import { teamSchema } from "@/lib/schemas/team-schema";

// Mock data for demonstration
const mockTeam: Team = {
  id: "1",
  members: [
    {
      id: "member1",
      name: "John Doe",
      role: "installer",
      skills: ["residential", "commercial"],
    },
  ],
  skills: ["residential", "commercial"],
  schedule: {
    id: "schedule1",
    teamId: "1",
    jobs: ["job1", "job2"],
    date: new Date(),
    status: "active",
  },
};

const mockMetrics = {
  completedJobs: 45,
  customerSatisfaction: 95,
};

export function TeamsView() {
  const [team] = useState<Team>(mockTeam);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateTeam = async (formData: z.infer<typeof teamSchema>) => {
    try {
      const teamData = {
        members: formData.members.map((member) => ({
          ...member,
          id: crypto.randomUUID(),
        })),
        skills: formData.skills,
        schedule: {
          id: crypto.randomUUID(),
          teamId: "", // Will update after team creation
          jobs: [],
          date: new Date(),
          status: "active" as const,
        },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "teams"), teamData);

      // Update schedule with teamId
      const scheduleRef = await addDoc(collection(db, "schedules"), {
        ...teamData.schedule,
        teamId: docRef.id,
      });

      // Update team with schedule id
      await updateDoc(doc(db, "teams", docRef.id), {
        "schedule.id": scheduleRef.id,
      });

      toast.success("Team created successfully");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Teams"
        text="Manage installation teams and their schedules"
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Team
        </Button>
      </PageHeader>

      {isFormOpen && (
        <TeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-8">
        <TeamSchedule team={team} schedule={team.schedule} />
      </div>

      <TeamMetrics team={team} metrics={mockMetrics} />
    </div>
  );
}
