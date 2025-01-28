import { LocationTag } from "@/lib/regions";
import { Timestamp } from 'firebase/firestore';

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent'
}

// TODO: be sure to keep jobstatus 'completed' once the job is done even if it is switched 'scheduled for next year' 
export enum JobStatus {
  Quote = 'quote',
  Scheduled = 'scheduled',
  Completed = 'completed',
  ScheduledNextYear = 'scheduled-next-year'
}

export enum InstallationType {
  Residential = 'residential',
  Commercial = 'commercial',
  Custom = 'custom'
}

export type Role = 'admin' | 'installer' | 'office';

export interface JobLocation {
  address: string;
  coordinates: LatLng;
  tag: LocationTag;
}

export interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  status: JobStatus;
  scheduledDate: Date | Timestamp;
  installationType: InstallationType; 
  location: JobLocation;
  teamAssigned: string[];
  priority: Priority;
  notes: string;
  createdAt: Timestamp;
  lastModified: Timestamp;
  cost: number;
} 

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  skills: string[];
  currentJob?: Job;
  schedule: Schedule;
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  skills: string[];
  phoneNumber: string;
  email: string;
  hireDate: Date;
  status: 'active' | 'inactive';
  emergencyContact: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
}

export interface Schedule {
  id: string;
  teamId: string;
  jobs: string[];
  date: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface WeatherData {
  forecastDate: Date;
  temperature: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: Timestamp;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

// we need to make some adjsutments to the team form. 1. we should have a dropwdown of team members with the role 'installer' instead of a regular name, role, and skills field. 2. team skills should not be in the team form. the team form should basically only be selecting the team members from a dropwdown. the layout should support multiple team members. there should be 2 dropdowns for team member selection and once the 'create team' button is clicked, the ui should be updated showing the team card. the default amount of teamcard components should be 2 but there should be a '+' icon to add another. here are the types for both team and team memeber so you know what to display on the card: 