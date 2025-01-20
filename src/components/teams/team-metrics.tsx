import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth"; // Create this hook to get user role
import type { Team } from "@/types";

interface TeamMetricsProps {
  team: Team;
  metrics: {
    completedJobs: number;
    customerSatisfaction: number;
  };
}

export function TeamMetrics({ team, metrics }: TeamMetricsProps) {
  const [revenue, setRevenue] = useState<number | null>(null);
  const { userRole } = useAuthStore();

  useEffect(() => {
    const fetchRevenue = async () => {
      if (userRole?.role === "admin" || userRole?.role === "office") {
        const jobsQuery = query(
          collection(db, "jobs"),
          where("teamId", "==", team.id),
          where("status", "==", "completed")
        );

        const snapshot = await getDocs(jobsQuery);
        const totalRevenue = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().cost || 0),
          0
        );

        setRevenue(totalRevenue);
      }
    };

    fetchRevenue();
  }, [team.id, userRole?.role]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-500">
              Completed Jobs
            </div>
            <div className="mt-1 text-3xl font-semibold">
              {metrics.completedJobs}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-500">
              Customer Satisfaction
            </div>
            <div className="mt-1 text-3xl font-semibold">
              {metrics.customerSatisfaction}%
            </div>
          </div>
          {revenue !== null && (
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-sm font-medium text-gray-500">
                Total Revenue
              </div>
              <div className="mt-1 text-3xl font-semibold">
                ${revenue.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
