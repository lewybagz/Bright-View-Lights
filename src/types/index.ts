import { Timestamp } from 'firebase/firestore';

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent'
}

export enum JobStatus {
  Pending = 'pending',
  Scheduled = 'scheduled',
  InProgress = 'in-progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
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
  tag: 'marana' | 'in-town' | 'out-of-town' | 'catalina' | 'vail';
}

export interface Job {
  id: string;
  customerId: string;
  status: JobStatus;
  scheduledDate: Date;
  estimatedDuration: number;
  installationType: InstallationType; 
  location: JobLocation;
  teamAssigned: string[];
  priority: Priority;
  notes: string;
  createdAt: Timestamp;
  lastModified: Timestamp;
  customerRating: number; 
  cost: number;
} 

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  contact: {
    phone: string;
    email: string;
    preferredContact: 'phone' | 'email';
  };
  address: string;
  jobHistory: string[];
  preferences: Record<string, unknown>;
  notes: string;
}

export interface Team {
  id: string;
  members: TeamMember[];
  skills: string[];
  currentJob?: string;
  schedule: Schedule;
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  skills: string[];
}

export interface Schedule {
  id: string;
  teamId: string;
  jobs: string[];
  date: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Availability {
  userId: string;
  dates: {
    start: Date;
    end: Date;
  }[];
  exceptions: Date[];
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