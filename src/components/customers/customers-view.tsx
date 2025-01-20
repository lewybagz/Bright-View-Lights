import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../ui/page-header";
import { CustomerForm } from "./customer-form";
import { CustomerList } from "./customer-list";
import { CustomerHistory } from "./customer-history";
import { CustomerCommunication } from "./customer-communication";
import type { Customer, Job } from "@/types";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  arrayUnion,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// import { sendEmail, sendSMS } from '@/lib/communications';
import { toast } from "sonner";

type CustomerFormData = {
  id?: string;
  name: string;
  contact: {
    phone: string;
    email: string;
    preferredContact: "phone" | "email";
  };
  address: string;
  preferences: Record<string, unknown>;
  notes: string;
};

// Add to your imports at the top of the file
const CUSTOMERS_COLLECTION = "customers";

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    contact: {
      phone: "555-0123",
      email: "john@example.com",
      preferredContact: "email",
    },
    address: "123 Main St, City, State",
    jobHistory: ["job1", "job2"],
    preferences: {},
    notes: "Prefers afternoon appointments",
  },
];

export function CustomersView() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerJobs, setCustomerJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (selectedCustomer) {
      const loadJobs = async () => {
        const jobs = await fetchCustomerJobs(selectedCustomer.id);
        setCustomerJobs(jobs);
      };
      loadJobs();
    } else {
      // Clear jobs when no customer is selected
      setCustomerJobs([]);
    }
  }, [selectedCustomer]);

  const fetchCustomerJobs = async (customerId: string): Promise<Job[]> => {
    try {
      const jobsQuery = query(
        collection(db, "jobs"),
        where("customerId", "==", customerId)
      );

      const snapshot = await getDocs(jobsQuery);

      // Transform the Firestore documents into Job objects
      const jobs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          status: data.status,
          scheduledDate: data.scheduledDate.toDate(),
          estimatedDuration: data.estimatedDuration,
          installationType: data.installationType,
          location: data.location,
          teamAssigned: data.teamAssigned,
          priority: data.priority,
          notes: data.notes,
          createdAt: data.createdAt,
          lastModified: data.lastModified,
          customerRating: data.customerRating,
          cost: data.cost,
        } as Job;
      });

      return jobs;
    } catch (error) {
      console.error("Error fetching customer jobs:", error);
      toast.error("Failed to load customer jobs");
      return [];
    }
  };

  const updateCustomerJobHistory = async (
    customerId: string,
    jobId: string
  ) => {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await updateDoc(customerRef, {
        jobHistory: arrayUnion(jobId),
      });
    } catch (error) {
      console.error("Error updating job history:", error);
    }
  };

  const handleCreateCustomer = async (
    data: Omit<Customer, "id" | "jobHistory">
  ) => {
    try {
      const customerData = {
        ...data,
        jobHistory: [],
        created: new Date(),
        lastModified: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _docRef = await addDoc(
        collection(db, CUSTOMERS_COLLECTION),
        customerData
      );
      toast.success("Customer Created", {
        description: `${data.name} has been added to the system`,
      });
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Error Creating Customer", {
        description: "Please try again or contact support",
      });
      console.error("Error creating customer:", error);
    }
  };

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!data.id) {
      toast.error("Error Updating Customer", {
        description: "Customer ID is missing",
      });
      return;
    }

    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, data.id);
      const updateData = {
        ...data,
        lastModified: new Date(),
      };

      await updateDoc(customerRef, updateData);
      toast.success("Customer Updated", {
        description: `${data.name}'s information has been updated`,
      });
      setEditingCustomer(null);
    } catch (error) {
      toast.error("Error Updating Customer", {
        description: "Please try again or contact support",
      });
      console.error("Error updating customer:", error);
    }
  };

  const handleSendMessage = async (
    message: string,
    method: "email" | "phone"
  ) => {
    if (!selectedCustomer) return;

    try {
      // Log the communication attempt
      await addDoc(
        collection(db, `customers/${selectedCustomer.id}/communications`),
        {
          method,
          message,
          timestamp: new Date(),
          status: "pending",
        }
      );

      // Use existing notification system to track status
      toast.success("Message Sent", {
        description: `Message sent to ${selectedCustomer.name} via ${method}`,
      });
    } catch (error) {
      toast.error("Error Sending Message", {
        description: `Failed to send ${method} message. Please try again.`,
      });
      console.error(`Error sending ${method} message:`, error);
    }
  };

  // Add this function to handle new job creation for a customer
  const handleCreateCustomerJob = async () => {
    if (!selectedCustomer) return;

    try {
      // Create a basic job for the customer
      const newJobData = {
        customerId: selectedCustomer.id,
        status: "pending",
        scheduledDate: new Date(), // Default to today
        estimatedDuration: 2, // Default duration
        installationType: ["residential"],
        location: {
          address: selectedCustomer.address, // Use customer's address by default
          coordinates: { lat: 0, lng: 0 }, // These will be updated by geocoding
          tag: "in-town", // This will be updated by location determination
        },
        teamAssigned: [],
        priority: "medium",
        notes: "",
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        customerRating: 0,
        cost: 0,
      };

      // Add the job to Firestore
      const jobRef = await addDoc(collection(db, "jobs"), newJobData);

      // Update the customer's job history
      await updateCustomerJobHistory(selectedCustomer.id, jobRef.id);

      // Fetch updated jobs to refresh the UI
      const updatedJobs = await fetchCustomerJobs(selectedCustomer.id);
      setCustomerJobs(updatedJobs);

      toast.success("New job created successfully");
    } catch (error) {
      console.error("Error creating new job:", error);
      toast.error("Failed to create new job");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Customers"
        text="Manage customer information and communication"
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </PageHeader>

      {isFormOpen && (
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {editingCustomer && (
        <CustomerForm
          initialData={editingCustomer}
          onSubmit={handleUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
        />
      )}

      {selectedCustomer ? (
        <div className="grid grid-cols-2 gap-8">
          <CustomerHistory customer={selectedCustomer} jobs={customerJobs} />
          <CustomerCommunication
            customer={selectedCustomer}
            onSendMessage={handleSendMessage}
          />
          <Button
            variant="outline"
            className="col-span-2"
            onClick={() => setSelectedCustomer(null)}
          >
            Back to Customer List
          </Button>
          <Button
            onClick={handleCreateCustomerJob}
            disabled={!selectedCustomer}
          >
            Create New Job
          </Button>
        </div>
      ) : (
        <CustomerList
          customers={customers}
          onEdit={setEditingCustomer}
          onView={setSelectedCustomer}
        />
      )}
    </div>
  );
}
