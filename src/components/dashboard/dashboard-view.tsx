import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { format, subDays } from "date-fns";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PageHeader } from "@/components/ui/page-header";
import { Job, JobStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createNewUser } from "@/lib/userManagement";
import { useAuthStore } from "@/store/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

export function DashboardView() {
  const [timeRange, setTimeRange] = useState("7d");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const { user, userRole } = useAuthStore();
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error("No admin is currently signed in");
  }

  useEffect(() => {
    console.log("Current User ID:", user?.uid);
    console.log("Current User Role:", userRole?.role);
  }, [user, userRole]);

  // Mock data for demonstration
  useEffect(() => {
    const fetchJobs = async () => {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      const jobsQuery = query(
        collection(db, "jobs"),
        where("createdAt", ">=", Timestamp.fromDate(startDate))
      );

      const snapshot = await getDocs(jobsQuery);
      setJobs(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job))
      );
      setLoading(false);
    };

    fetchJobs();
  }, [timeRange]);

  const labels = Array.from(
    { length: Number(timeRange.replace("d", "")) },
    (_, i) => format(subDays(new Date(), i), "MMM d")
  ).reverse();

  const data = Array(labels.length).fill(0);

  jobs.forEach((job) => {
    const date = format(job.createdAt.toDate(), "MMM d");
    const idx = labels.indexOf(date);
    if (idx !== -1) {
      data[idx] += job.cost || 0;
    }
  });

  const revenueData: RevenueData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const jobsByStatus = Object.values(JobStatus).reduce((acc, status) => {
    acc[status] = jobs.filter((job) => job.status === status).length;
    return acc;
  }, {} as Record<JobStatus, number>);

  const jobsData = {
    labels: Object.values(JobStatus),
    datasets: [
      {
        label: "Jobs by Status",
        data: Object.values(jobsByStatus),
        backgroundColor: [
          "rgba(255, 206, 86, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 99, 132, 0.5)",
        ],
      },
    ],
  };

  const metrics = {
    activeJobs: jobs.filter((job) => job.status === JobStatus.Scheduled).length,
    totalRevenue: jobs.reduce((sum, job) => sum + (job.cost || 0), 0),
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Dashboard"
        text="Business performance overview and analytics"
      >
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{metrics.activeJobs}</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{metrics.totalRevenue}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">94%</div>
            <div className="text-sm text-muted-foreground">
              On-time Completion
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
          </CardHeader>
          <CardContent>
            <Line data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Jobs by Status</h3>
          </CardHeader>
          <CardContent>
            <Bar data={jobsData} />
          </CardContent>
        </Card>
      </div>
      {userRole?.role === "admin" && (
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogTrigger asChild>
            <Button variant="outline">Create User</Button>
          </DialogTrigger>
          <DialogContent className="w-[50vw] flex flex-col gap-4 p-6">
            <DialogHeader className="flex flex-col items-center gap-2">
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground text-center">
                Enter the email address for the new user. They will receive the
                default password for their initial login.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createNewUser(newUserEmail);
                  setShowCreateUser(false);
                  setNewUserEmail("");
                } catch (error) {
                  if (error instanceof Error) {
                    setCreateUserError(error.message);
                  } else {
                    setCreateUserError("An unexpected error occurred");
                  }
                }
              }}
            >
              <div className="space-y-4">
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
                {createUserError && (
                  <div className="text-red-500 text-sm">{createUserError}</div>
                )}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateUser(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create User</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
