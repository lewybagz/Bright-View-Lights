import { createContext } from "react";
import { Team } from "@/types";

export interface TeamContextType {
  editingTeam: Team | null;
  setEditingTeam: (team: Team) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
}

export const TeamContext = createContext<TeamContextType | null>(null);
