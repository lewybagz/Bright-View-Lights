import { useContext } from 'react';
import { TeamContext } from '@/components/contexts/TeamContext';

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}