import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Job,
  InstallationType,
  Priority,
  JobStatus,
  Team,
  TeamMember,
} from "@/types";
import { JobFormData, jobSchema } from "@/lib/schemas/job-schema";
import { cn } from "@/lib/utils";
import AddressAutocomplete from "../AddressAutocomplete";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
  setJobs?: React.Dispatch<React.SetStateAction<Job[]>>;
  teams: Team[];
}

export function JobForm({
  initialData,
  onSubmit,
  onCancel,
  teams,
}: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.scheduledDate
  );
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>(
    []
  );

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Setting isSubmitting to true");

      // Prepare the job data
      const jobData = {
        ...data,
        scheduledDate: date || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("Prepared job data:", jobData);

      if (initialData?.id) {
        // Update existing job
        console.log("Updating existing job");
        const jobRef = doc(db, "jobs", initialData.id);
        await updateDoc(jobRef, {
          ...jobData,
          updatedAt: new Date(),
        });

        toast.success("Job Updated", {
          description: "The job has been successfully updated.",
        });
      } else {
        // Create new job
        console.log("Creating new job");
        const jobRef = collection(db, "jobs");
        await addDoc(jobRef, jobData);

        toast.success("Job Created", {
          description: "The job has been successfully created.",
        });
      }

      // Call the parent's onSubmit handler with the job data
      console.log("Calling parent onSubmit");
      await onSubmit(jobData);
    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error("Error", {
        description: "There was an error saving the job. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData || {
      notes: "",
      teamAssigned: [],
      status: JobStatus.Quote,
    },
    mode: "onSubmit",
  });

  const handleFormValidation = handleSubmit(async (data) => {
    console.log("Form data before submission:", data);

    if (
      (data.status === JobStatus.Scheduled ||
        data.status === JobStatus.ScheduledNextYear) &&
      !date
    ) {
      toast.error("Please select a scheduled date");
      return;
    }

    try {
      await handleFormSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  const installationTypes = Object.values(InstallationType);
  const priorities = Object.values(Priority);
  const jobStatuses = Object.values(JobStatus);

  return (
    <form onSubmit={handleFormValidation} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer</Label>
          <Input id="customerId" {...register("customerId")} />
          {errors.customerId && (
            <p className="text-sm text-red-500">{errors.customerId.message}</p>
          )}
        </div>

        <div className="space-y-2 flex flex-col justify-end gap-1">
          <Label>Scheduled Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <Input
              id="cost"
              type="number"
              className="pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              {...register("cost", { valueAsNumber: true })}
            />
          </div>
          {errors.cost && (
            <p className="text-sm text-red-500">{errors.cost.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {jobStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamAssigned">Team Assignment</Label>
          <Controller
            name="teamAssigned"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value?.[0] || ""} // Use first value or empty string
                onValueChange={(teamId) => {
                  // Find the selected team
                  const selectedTeam = teams.find((team) => team.id === teamId);

                  if (selectedTeam) {
                    // Get member IDs from the team
                    const memberIds = selectedTeam.members.map(
                      (member) => member.id
                    );

                    // Update form field with member IDs
                    field.onChange(memberIds);

                    // Optionally store full member objects for display
                    setSelectedTeamMembers(selectedTeam.members);
                  } else {
                    field.onChange([]);
                    setSelectedTeamMembers([]);
                  }
                }}
                disabled={
                  !["scheduled", "scheduled-next-year"].includes(
                    watch("status")
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {`Team ${team.id} (${team.members.length} members)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.teamAssigned && (
            <p className="text-sm text-red-500">
              {errors.teamAssigned.message}
            </p>
          )}

          {/* Optional: Display selected team members */}
          {selectedTeamMembers.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Team Members:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedTeamMembers.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {member.name} ({member.role})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.priority && (
            <p className="text-sm text-red-500">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="installationType">Installation Type</Label>
          <Controller
            name="installationType"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select value={value ?? ""} onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select installation type" />
                </SelectTrigger>
                <SelectContent>
                  {installationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.installationType && (
            <p className="text-sm text-red-500">
              {errors.installationType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <AddressAutocomplete control={control} errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={() => console.log("Submit button clicked")}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">
                {initialData ? "Updating..." : "Creating..."}
              </span>
              {/* Add a loading spinner component if you have one */}
            </>
          ) : initialData ? (
            "Update Job"
          ) : (
            "Create Job"
          )}
        </Button>
      </div>
    </form>
  );
}
