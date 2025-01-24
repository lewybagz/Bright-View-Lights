import { useEffect, useState } from "react";
import { Link, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TeamForm } from "./team-form";
import { TeamSchedule } from "./team-schedule";
import { TeamMetrics } from "./team-metrics";
import { type Team, type TeamMember } from "@/types";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { getTeamSkills } from "@/lib/team-utils";
import { TeamCard } from "./team-card";

export function TeamsView({
  setEditingTeam,
}: {
  setEditingTeam: (team: Team) => void;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [installers, setInstallers] = useState<TeamMember[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teams
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const teamsData = teamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];
        setTeams(teamsData);

        // Fetch installers
        const installersQuery = query(
          collection(db, "teamMembers"),
          where("role", "==", "installer"),
          where("status", "==", "active")
        );
        const installersSnapshot = await getDocs(installersQuery);
        const installersData = installersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamMember[];
        setInstallers(installersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTeam = async ({
    name,
    memberIds,
  }: {
    name: string;
    memberIds: string[];
  }) => {
    try {
      const members = installers.filter((installer) =>
        memberIds.includes(installer.id)
      );
      const teamData = {
        name,
        members,
        skills: getTeamSkills(members),
        schedule: {
          id: crypto.randomUUID(),
          teamId: "",
          jobs: [],
          date: new Date(),
          status: "active" as const,
        },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "teams"), teamData);
      const scheduleRef = await addDoc(collection(db, "schedules"), {
        ...teamData.schedule,
        teamId: docRef.id,
      });

      await updateDoc(doc(db, "teams", docRef.id), {
        "schedule.id": scheduleRef.id,
      });

      const newTeam = {
        id: docRef.id,
        ...teamData,
        schedule: {
          ...teamData.schedule,
          id: scheduleRef.id,
          teamId: docRef.id,
        },
      };
      setTeams((prev) => [...prev, newTeam]);

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
        <div className="flex gap-4">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Team
          </Button>
          <Button
            asChild
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Link to="/team-members">Manage Team Members</Link>
          </Button>
        </div>
      </PageHeader>

      {isFormOpen && (
        <TeamForm
          installers={installers}
          onSubmit={handleCreateTeam}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {loading ? (
        <div>Loading teams...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={(team) => {
                  setEditingTeam(team);
                  setIsFormOpen(true);
                }}
              />
            ))}
          </div>

          {/* Detailed team information section */}
          <div className="mt-8">
            {teams.map((team) => (
              <div key={team.id} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  {team.members.map((m) => m.name).join(", ")}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TeamSchedule team={team} schedule={team.schedule} />
                  <TeamMetrics
                    team={team}
                    metrics={{
                      completedJobs: 0,
                      customerSatisfaction: 95,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
