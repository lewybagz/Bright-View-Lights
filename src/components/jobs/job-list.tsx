import { useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Job } from '@/types';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onView: (job: Job) => void;
}

export function JobList({ jobs, onEdit, onView }: JobListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className="border-b">
                <td className="p-2">{job.customerId}</td>
                <td className="p-2">{format(job.scheduledDate, 'PP')}</td>
                <td className="p-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                    ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                    job.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                    ${job.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    job.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    job.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'}`}>
                    {job.priority}
                  </span>
                </td>
                <td className="p-2">{job.location.address}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onView(job)}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => onEdit(job)}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}