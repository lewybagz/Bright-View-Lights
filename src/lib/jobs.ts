// src/lib/jobs.ts
import { collection, query, orderBy, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';

interface FetchJobsResult {
  jobs: Job[];
  error: Error | null;
}

export async function fetchJobs(): Promise<FetchJobsResult> {
  try {
    const jobsQuery = query(
      collection(db, "jobs"),
      orderBy("scheduledDate", "desc")
    );

    const snapshot = await getDocs(jobsQuery);
    const jobsData = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        scheduledDate: data.scheduledDate.toDate(),
        createdAt: data.createdAt.toDate(),
        lastModified: data.lastModified.toDate(),
      } as Job;
    });

    return { jobs: jobsData, error: null };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], error: error as Error };
  }
}

// Optional: Add a function to filter jobs if needed
export function filterJobs(jobs: Job[], searchTerm: string = '', statusFilter: string = 'all', priorityFilter: string = 'all') {
  return jobs.filter((job) => {
    const matchesSearch =
      job.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}