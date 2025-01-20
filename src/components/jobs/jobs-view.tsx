import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { JobList } from "./job-list";
import { JobForm } from "./job-form";
import { JobDetails } from "./job-details";
import type { Job } from "@/types";
import { geocodeAddress } from "@/lib/geocoding";
import { determineLocationTag } from "@/lib/location";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { JobFormData } from "@/lib/schemas/job-schema";

export function JobsView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Define our fetch function
    const fetchJobs = async () => {
      try {
        // Create a query that orders jobs by scheduled date
        const jobsQuery = query(
          collection(db, "jobs"),
          orderBy("scheduledDate", "desc")
        );

        // Fetch the jobs
        const snapshot = await getDocs(jobsQuery);

        // Transform the data and update state
        const jobsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date for scheduledDate
          scheduledDate: doc.data().scheduledDate.toDate(),
          createdAt: doc.data().createdAt,
          lastModified: doc.data().lastModified,
        })) as Job[];

        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    // Call our fetch function
    fetchJobs();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Loading jobs...</div>;
  }

  const handleCreateJob = async (data: JobFormData) => {
    try {
      // First geocode the address to get coordinates
      const coordinates = await geocodeAddress(data.location.address);
      const locationTag = determineLocationTag(coordinates);

      // Prepare the complete job data with all required fields
      const jobData = {
        ...data,
        location: {
          ...data.location,
          coordinates,
          tag: locationTag,
        },
        // Initialize rating as null since it hasn't been rated yet
        customerRating: 0,
        // Set timestamps using Firebase server timestamp
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        // Ensure required arrays are initialized if not provided
        teamAssigned: data.teamAssigned || [],
        installationType: data.installationType || [],
        // Set initial status if not provided
        status: data.status || "pending",
        // Ensure cost is set
        cost: data.cost || 0,
        // Ensure notes field exists
        notes: data.notes || "",
      };

      // Validate that all required fields are present
      const requiredFields = [
        "customerId",
        "scheduledDate",
        "estimatedDuration",
        "location",
        "priority",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in jobData)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Add to Firestore and get the document reference
      const docRef = await addDoc(collection(db, "jobs"), jobData);

      // Create a complete job object with the new ID
      const newJob: Job = {
        id: docRef.id,
        ...data,
        location: {
          ...data.location,
          coordinates,
          tag: locationTag,
        },
        customerRating: 0,
        createdAt: Timestamp.fromDate(new Date()),
        lastModified: Timestamp.fromDate(new Date()),
        teamAssigned: data.teamAssigned || [],
        installationType: data.installationType || [],
        status: data.status || "pending",
        cost: data.cost || 0,
        notes: data.notes || "",
      };

      // Update our local state with the new job
      setJobs((currentJobs) => [...currentJobs, newJob]);

      toast.success("Job created successfully");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating job:", error);

      // Provide more specific error messages
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create job. Please check all fields and try again.";

      toast.error(errorMessage);
    }
  };

  const handleUpdateJob = async (data: JobFormData) => {
    try {
      const coordinates = await geocodeAddress(data.location.address);
      const locationTag = determineLocationTag(coordinates);

      const jobRef = doc(collection(db, "jobs"), data.id);
      await updateDoc(jobRef, {
        ...data,
        location: {
          ...data.location,
          coordinates,
          tag: locationTag,
        },
        lastModified: serverTimestamp(),
      });

      setEditingJob(null);
      toast.success("Job updated successfully");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setSelectedJob(null);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setEditingJob(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Jobs"
        text="Manage installation jobs and track their progress"
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Job
        </Button>
      </PageHeader>

      {isFormOpen && (
        <JobForm
          onSubmit={handleCreateJob}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {editingJob && (
        <JobForm
          initialData={editingJob}
          onSubmit={handleUpdateJob}
          onCancel={() => setEditingJob(null)}
        />
      )}

      {selectedJob && (
        <JobDetails
          job={selectedJob}
          onEdit={handleEditJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <JobList jobs={jobs} onEdit={handleEditJob} onView={handleViewJob} />
    </div>
  );
}
