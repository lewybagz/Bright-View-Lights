// use-customer-jobs.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { getJobsQuery } from '@/lib/firebase';
import type { Job } from '@/types';

interface JobPage {
  jobs: Job[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | undefined;
}
 
 export function useCustomerJobs(customerId: string) {
  return useInfiniteQuery<JobPage, Error, JobPage, unknown[], QueryDocumentSnapshot<DocumentData> | undefined>({
    queryKey: ['customer-jobs', customerId],
    queryFn: async ({ pageParam }) => {
      const query = getJobsQuery(customerId, pageParam);
      const snapshot = await getDocs(query);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot;
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
 
      return {
        jobs,
        lastDoc,
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });
 }