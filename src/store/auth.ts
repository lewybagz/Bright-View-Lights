import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Role } from '@/types';

interface UserRole {
 id: string;
 role: Role;
 email: string;
}

interface AuthState {
 user: User | null;
 userRole: UserRole | null;
 loading: boolean;
 setUser: (user: User | null) => void;
 setUserRole: (role: UserRole | null) => void;
 setLoading: (loading: boolean) => void;
 fetchUserRole: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
 user: null,
 userRole: null,
 loading: true,
 setUser: (user) => set({ user }),
 setUserRole: (role) => set({ userRole: role }),
 setLoading: (loading) => set({ loading }),
 fetchUserRole: async (userId) => {
   try {
     const userDoc = await getDoc(doc(db, 'users', userId));
     if (userDoc.exists()) {
       set({ userRole: userDoc.data() as UserRole });
     }
   } catch (error) {
     console.error('Error fetching user role:', error);
   }
 }
}));