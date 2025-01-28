import { toast } from 'sonner';
import { db } from './firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useAuthStore } from '@/store/auth';

export function setupNotifications() {
  const { user } = useAuthStore.getState();
  if (!user) return;

  // Listen for new jobs
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('status', '==', 'pending'),
    orderBy('created', 'desc')
  );

  onSnapshot(jobsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const job = change.doc.data();
        toast.info('New Job Created', {
          description: `Job #${change.doc.id} has been created for ${job.customerName}`,
        });
      }
    });
  });

  // Listen for job status changes
  const activeJobsQuery = query(
    collection(db, 'jobs'),
    where('status', 'in', ['scheduled', 'in-progress'])
  );

  onSnapshot(activeJobsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        const job = change.doc.data();
        toast.info('Job Status Updated', {
          description: `Job #${change.doc.id} status changed to ${job.status}`,
        });
      }
    });
  });
}