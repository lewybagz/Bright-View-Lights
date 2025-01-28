import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "@/components/layout/layout";
import { SignIn } from "@/components/auth/sign-in";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CalendarView } from "@/components/calendar/calendar-view";
import { JobsView } from "@/components/jobs/jobs-view";
import { TeamsView } from "@/components/teams/teams-view";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { useAuthStore } from "@/store/auth";
import { setupNotifications } from "@/lib/notifications";
import { ServiceAreaMap } from "./components/ServiceAreaMap";
import { useGoogleMaps } from "./hooks/use-google-maps";
import { TeamMembersView } from "./components/team-members/team-members-view";
import { TeamProvider } from "./components/contexts/TeamProvider";

function App() {
  const { isLoaded, error } = useGoogleMaps(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  );
  const { loading, user } = useAuthStore();

  useEffect(() => {
    // Only proceed with notifications setup if we have a user
    if (user) {
      console.time("Notifications Setup");

      // Track if the component is still mounted
      let isMounted = true;

      // Async function to handle setup
      const initializeNotifications = async () => {
        try {
          setupNotifications();
        } catch (error) {
          // Only log errors if component is still mounted
          if (isMounted) {
            console.error("Failed to setup notifications:", error);
            console.timeEnd("Notifications Setup"); // End timing even if there's an error
          }
        }
      };

      // Start the initialization process
      initializeNotifications();

      // Cleanup function to prevent updates after unmount
      return () => {
        isMounted = false;
      };
    }
  }, [user]);

  if (loading || !isLoaded) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("Failed to load Google Maps:", error);
    return <div>Error loading Google Maps</div>;
  }

  return (
    <>
      <TeamProvider>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="jobs" element={<JobsView />} />
            <Route path="teams" element={<TeamsView />} />
            <Route path="team-members" element={<TeamMembersView />} />
            <Route path="/service-area" element={<ServiceAreaMap />} />
          </Route>
        </Routes>
      </TeamProvider>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
