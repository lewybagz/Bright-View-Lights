// team-form.tsx
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TeamMember } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface TeamFormProps {
  installers: TeamMember[];
  onSubmit: (data: { name: string; memberIds: string[] }) => Promise<void>;
  onCancel: () => void;
}

export function TeamForm({ onSubmit, onCancel }: TeamFormProps) {
  const [installers, setInstallers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(["", ""]);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const fetchInstallers = async () => {
      const q = query(
        collection(db, "teamMembers"),
        where("role", "==", "installer"),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      setInstallers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamMember[]
      );
    };
    fetchInstallers();
  }, []);

  const handleAddMember = () => {
    setSelectedMembers([...selectedMembers, ""]);
  };

  const handleRemoveMember = (index: number) => {
    setSelectedMembers(selectedMembers.filter((_, i) => i !== index));
  };

  const handleMemberSelect = (value: string, index: number) => {
    const newMembers = [...selectedMembers];
    newMembers[index] = value;
    setSelectedMembers(newMembers);
  };

  const handleSubmit = () => {
    onSubmit({
      name: teamName,
      memberIds: selectedMembers.filter((id) => id !== ""),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="teamName">Team Name</Label>
        <Input
          id="teamName"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>
      {selectedMembers.map((memberId, index) => (
        <Card key={index}>
          <CardContent className="pt-6 flex items-center gap-4">
            <Select
              value={memberId}
              onValueChange={(value) => handleMemberSelect(value, index)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select installer" />
              </SelectTrigger>
              <SelectContent>
                {installers.map((installer) => (
                  <SelectItem key={installer.id} value={installer.id}>
                    {installer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {index >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddMember}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Team Member
      </Button>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Team</Button>
      </div>
    </div>
  );
}
