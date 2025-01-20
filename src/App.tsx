import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "@/components/layout/layout";
import { SignIn } from "@/components/auth/sign-in";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CalendarView } from "@/components/calendar/calendar-view";
import { JobsView } from "@/components/jobs/jobs-view";
import { CustomersView } from "@/components/customers/customers-view";
import { TeamsView } from "@/components/teams/teams-view";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { useAuthStore } from "@/store/auth";
import { setupNotifications } from "@/lib/notifications";
import { ServiceAreaMap } from "./components/ServiceAreaMap";
import { useGoogleMaps } from "./hooks/use-google-maps";

function App() {
  const { isLoaded, error } = useGoogleMaps(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  );
  const { loading, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      setupNotifications();
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
          <Route path="customers" element={<CustomersView />} />
          <Route path="teams" element={<TeamsView />} />
          <Route path="/service-area" element={<ServiceAreaMap />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
