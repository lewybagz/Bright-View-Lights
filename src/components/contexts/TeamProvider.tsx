import { ReactNode, useState } from "react";
import { Team } from "@/types";
import { TeamContext } from "./TeamContext";

export function TeamProvider({ children }: { children: ReactNode }) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <TeamContext.Provider
      value={{
        editingTeam,
        setEditingTeam,
        isFormOpen,
        setIsFormOpen,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
