// use-customers.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { getCustomersQuery } from '@/lib/firebase';
import type { Customer } from '@/types';

export interface CustomerPage {
  customers: Customer[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}

export const useCustomers = () => {
  return useInfiniteQuery<CustomerPage, Error, CustomerPage, unknown[], QueryDocumentSnapshot | undefined>({
    queryKey: ['customers'],
    queryFn: async ({ pageParam }) => {
      const query = getCustomersQuery(pageParam);  
      const snapshot = await getDocs(query);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot;
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];
      return {
        customers,
        lastDoc,
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });
 };