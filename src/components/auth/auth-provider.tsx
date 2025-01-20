import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, fetchUserRole } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // When a user signs in, Firebase gives us a User object
        setUser(user);
        // We use user.uid to fetch their role from Firestore
        await fetchUserRole(user.uid);
      } else {
        // When a user signs out, we clear their information
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up the auth state listener when the component unmounts
    return () => unsubscribe();
  }, [setUser, setLoading, fetchUserRole]);

  return <>{children}</>;
}
