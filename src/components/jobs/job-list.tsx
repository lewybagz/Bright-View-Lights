import { useEffect, useState } from "react";
import { ClipboardX, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Job } from "@/types";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EnhancedJobView } from "./job-card";

interface JobListProps {
  initialJobs?: Job[];
  onEdit: (job: Job) => void;
  onView: (job: Job) => void;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

export function JobList({
  initialJobs = [],
  onEdit,
  onView,
  setJobs,
}: JobListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchInitialJobs = async () => {
      try {
        setIsFetching(true);
        const jobsQuery = query(
          collection(db, "jobs"),
          orderBy("scheduledDate", "desc"),
          limit(10)
        );

        const snapshot = await getDocs(jobsQuery);
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastDoc(lastVisible);
        setHasMore(snapshot.docs.length === 10);

        const initialJobsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            scheduledDate: new Date(data.scheduledDate),
            createdAt: new Date(data.createdAt),
            lastModified: new Date(data.lastModified),
          } as Job;
        });

        setJobs(initialJobsData);
      } catch (error) {
        console.error("Error fetching initial jobs:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialJobs();
  }, [setJobs]);

  const loadMoreJobs = async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const jobsQuery = query(
        collection(db, "jobs"),
        orderBy("scheduledDate", "desc"),
        lastDoc ? startAfter(lastDoc) : limit(10)
      );

      const snapshot = await getDocs(jobsQuery);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === 10);

      const newJobs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate.toDate(),
          createdAt: data.createdAt.toDate(),
          lastModified: data.lastModified.toDate(),
        };
      }) as Job[];

      setJobs((currentJobs: Job[]) => {
        const uniqueJobs = [...currentJobs];
        newJobs.forEach((newJob) => {
          if (!uniqueJobs.find((job) => job.id === newJob.id)) {
            uniqueJobs.push(newJob);
          }
        });
        return uniqueJobs;
      });
    } catch (error) {
      console.error("Error loading more jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs =
    initialJobs?.filter((job) => {
      const matchesSearch =
        job.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    }) ?? [];

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled-next-year">
                Scheduled Next Year
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid of Job Cards */}
      {isFetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <EnhancedJobView
              key={job.id}
              job={job}
              onView={onView}
              onEdit={onEdit}
              onClose={() => {}}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMoreJobs}
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Loading...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Load More Jobs"
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <ClipboardX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
