import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useInView } from "react-intersection-observer";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { InstallationType, JobStatus, type Customer, type Job } from "@/types";
import {
  getDocs,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CustomerHistoryProps {
  customer: Customer;
  initialJobs?: Job[];
}

export function CustomerHistory({
  customer,
  initialJobs = [],
}: CustomerHistoryProps) {
  // State for managing jobs and pagination
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Set up intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  // Function to load more jobs
  const fetchMoreJobs = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);

      // Create a query for the next batch of jobs
      const jobsRef = collection(db, "jobs");
      const baseQuery = query(
        jobsRef,
        where("customerId", "==", customer.id),
        orderBy("scheduledDate", "desc"),
        limit(10)
      );

      // Add startAfter if we have a last document
      const jobsQuery = lastDoc
        ? query(baseQuery, startAfter(lastDoc))
        : baseQuery;

      const snapshot = await getDocs(jobsQuery);

      // Check if we have more data to load
      setHasMore(snapshot.docs.length === 10);

      // Update the last document for next pagination
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);

      // Transform and add new jobs to state
      const newJobs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];

      setJobs((prevJobs) => [...prevJobs, ...newJobs]);
    } catch (error) {
      console.error("Error fetching customer jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [customer.id, hasMore, isLoading, lastDoc]);

  // Watch for intersection and fetch more jobs when needed
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchMoreJobs();
    }
  }, [fetchMoreJobs, hasMore, inView, isLoading]);

  // Helper function to format installation type
  function formatInstallationType(type: InstallationType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Customer History</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job: Job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <div className="font-medium">Job #{job.id}</div>
                <div className="text-sm text-muted-foreground">
                  {format(job.scheduledDate, "PPP")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatInstallationType(job.installationType)}
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === JobStatus.Completed
                    ? "bg-green-100 text-green-700"
                    : job.status === JobStatus.Scheduled
                    ? "bg-blue-100 text-blue-700"
                    : job.status === JobStatus.ScheduledNextYear
                    ? "bg-yellow-100 text-yellow-700"
                    : job.status === JobStatus.Quote
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {job.status
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </div>
            </div>
          ))}

          {/* Loading indicator and intersection observer target */}
          <div ref={ref} className="h-4">
            {isLoading && (
              <div className="text-center text-sm text-muted-foreground">
                Loading more jobs...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
