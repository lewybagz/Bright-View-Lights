// components/team-members/team-members-view.tsx
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TeamMember } from "@/types";
import { TeamMembersList } from "./team-members-list";
import { TeamMemberForm, type TeamMemberFormData } from "./team-member-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeamMemberDetails } from "./team-member-details";

export function TeamMembersView() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const teamMembersQuery = query(
          collection(db, "teamMembers"),
          orderBy("name")
        );

        const snapshot = await getDocs(teamMembersQuery);
        const membersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamMember[];

        setTeamMembers(membersList);
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleCreateMember = async (data: TeamMemberFormData) => {
    try {
      const docRef = await addDoc(collection(db, "teamMembers"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newMember: TeamMember = {
        id: docRef.id,
        ...data,
      };

      setTeamMembers((current) => [...current, newMember]);
      toast.success("Team member added successfully");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating team member:", error);
      toast.error("Failed to create team member");
    }
  };

  const handleUpdateMember = async (data: TeamMemberFormData) => {
    try {
      const docRef = doc(db, "teamMembers", editingMember!.id); // Use existing ID
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember!.id ? { ...member, ...data } : member
        )
      );
      setEditingMember(null);
      toast.success("Team member updated successfully");
    } catch (error) {
      toast.error("Failed to update team member");
      console.error("Error updating team member:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading team members...</div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button onClick={() => setIsFormOpen(true)}>Add Team Member</Button>
      </div>

      <TeamMembersList
        members={teamMembers}
        onEdit={(member) => setEditingMember(member)}
        onView={(member) => setSelectedMember(member)}
      />

      {isFormOpen && (
        <TeamMemberForm
          onSubmit={handleCreateMember}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {editingMember && (
        <TeamMemberForm
          initialData={editingMember}
          onSubmit={handleUpdateMember}
          onCancel={() => setEditingMember(null)}
        />
      )}

      {selectedMember && (
        <TeamMemberDetails
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
