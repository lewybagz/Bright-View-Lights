import { format } from "date-fns";
import { useInView } from "react-intersection-observer";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useCustomerJobs } from "@/hooks/use-customer-jobs";
import type { Customer, Job } from "@/types";

interface CustomerHistoryProps {
  customer: Customer;
  jobs: Job[];
}

export function CustomerHistory({ customer }: CustomerHistoryProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCustomerJobs(customer.id);

  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  // Load more when the last item is in view
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Customer History</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
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
                  {job.installationType.join(", ")}
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium
                ${
                  job.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : job.status === "in-progress"
                    ? "bg-blue-100 text-blue-700"
                    : job.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {job.status}
              </div>
            </div>
          ))}

          <div ref={ref} className="h-4" />
        </div>
      </CardContent>
    </Card>
  );
}
