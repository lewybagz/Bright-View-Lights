import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import { DateTimeSelector } from "../ui/DateTimeSelector";
import { determineLocationTag } from "@/lib/regions";
interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
  setJobs?: React.Dispatch<React.SetStateAction<Job[]>>;
  teams: Team[];
  onTeamAssign: (teamId: string, jobId: string) => Promise<void>;
}

export function JobForm({
  initialData,
  onCancel,
  setJobs,
  teams,
  onTeamAssign,
}: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.scheduledDate instanceof Timestamp
      ? initialData.scheduledDate.toDate()
      : initialData?.scheduledDate
  );
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>(
    []
  );

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Format the number
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    } else if (cleaned.length > 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length > 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }

    return cleaned;
  };

  const defaultLocation = {
    address: "",
    coordinates: { lat: 0, lng: 0 },
    tag: determineLocationTag({ lat: 0, lng: 0 }),
  };

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);
      console.log("handleFormSubmit called with data:", data);

      // Prepare the job data with all necessary fields
      const jobData = {
        ...data,
        scheduledDate: Timestamp.fromDate(date || new Date()),
        createdAt: Timestamp.now(),
        lastModified: Timestamp.now(),
        customerRating: 0,
        cost: data.cost || 0,
        teamAssigned: data.teamAssigned || [],
        location: data.location || defaultLocation,
      } as Job;

      let savedJob: Job;

      let savedJobId: string;

      // Handle updating existing job or creating new job
      if (initialData?.id) {
        const jobRef = doc(db, "jobs", initialData.id);
        await updateDoc(jobRef, {
          ...jobData,
          lastModified: Timestamp.now(), // Update modification time
          createdAt: initialData.createdAt, // Keep original creation time
        });
        savedJobId = initialData.id;
        savedJob = { ...jobData, id: initialData.id };
        toast.success("Job Updated Successfully");
      } else {
        // Create new job
        const jobRef = collection(db, "jobs");
        const now = Timestamp.now();
        const newJobData = {
          ...jobData,
          createdAt: now,
          lastModified: now,
        };
        const docRef = await addDoc(jobRef, newJobData);
        savedJobId = docRef.id;
        savedJob = { ...jobData, id: docRef.id };
        toast.success("Job Created Successfully");
      }

      // Update jobs list if setJobs is provided
      if (setJobs) {
        setJobs((prevJobs: Job[]) => {
          if (initialData?.id) {
            return prevJobs.map((job: Job) =>
              job.id === initialData.id
                ? ({
                    ...job,
                    ...jobData,
                    id: initialData.id,
                    // Convert Timestamps to Dates for UI
                    createdAt: job.createdAt, // Keep original creation date
                    lastModified: Timestamp.now(), // Update modification date
                  } as Job)
                : job
            );
          } else {
            return [
              ...prevJobs,
              {
                ...jobData,
                id: savedJobId,
                // Convert Timestamps to Dates for UI
                createdAt: Timestamp.now(),
                lastModified: Timestamp.now(),
              } as Job,
            ];
          }
        });
      }

      // Handle team assignment if needed
      if (data.teamAssigned && data.teamAssigned[0]) {
        await onTeamAssign(data.teamAssigned[0], savedJobId);
      }

      // Close the form or redirect
      onCancel();
      return savedJob;
    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error("Error saving the job. Please try again.");
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
    setValue,
  } = useForm<JobFormData>({
    // Notice we're explicitly using JobFormData here
    resolver: zodResolver(jobSchema),
    defaultValues: {
      // Spread the initial data if it exists, otherwise use default values
      ...initialData,
      notes: initialData?.notes || "",
      teamAssigned: initialData?.teamAssigned || [],
      status: initialData?.status || JobStatus.Quote,
      scheduledDate:
        initialData?.scheduledDate instanceof Timestamp
          ? initialData.scheduledDate.toDate()
          : initialData?.scheduledDate || undefined,

      customerPhone: initialData?.customerPhone || "",
      cost: initialData?.cost || 0,
      installationType:
        initialData?.installationType || InstallationType.Residential,
      priority: initialData?.priority || Priority.Medium,
      location: initialData?.location || defaultLocation,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    console.log("===================");
    console.log("All Form Values:", watch());
  }, [watch]);

  const handleFormValidation = handleSubmit(async (data) => {
    console.log("=== Starting Form Validation ===");
    console.log("Form Data for Validation:", data);

    // Check if status is Scheduled or ScheduledNextYear
    const isScheduledStatus =
      data.status === JobStatus.Scheduled ||
      data.status === JobStatus.ScheduledNextYear;

    if (isScheduledStatus) {
      const errors: string[] = [];

      // Check for scheduled date
      if (!date) {
        errors.push("Scheduled date is required for scheduled jobs");
      }

      // Check for team assignment
      if (!data.teamAssigned?.length) {
        errors.push("Team assignment is required for scheduled jobs");
      }

      // If we found any errors, display them and stop submission
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
        return;
      }
    }

    // If we get here, proceed with form submission
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
    <form
      onSubmit={(e) => {
        console.log("Form submit event triggered");
        handleFormValidation(e);
      }}
      onInvalid={(e) => {
        console.log("Form invalid event triggered", e);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer</Label>
          <Input id="customerName" {...register("customerName")} />
          {errors.customerName && (
            <p className="text-sm text-red-500">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone Number</Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="(555) 555-5555"
            {...register("customerPhone", {
              pattern: {
                value: /^\(\d{3}\) \d{3}-\d{4}$/,
                message: "Please enter phone number in format (555) 555-5555",
              },
            })}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              e.target.value = formatted;
            }}
          />
          {errors.customerPhone && (
            <p className="text-sm text-red-500">
              {errors.customerPhone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <DateTimeSelector
            date={date}
            onDateTimeChange={(newDateTime) => {
              setDate(newDateTime);
              setValue("scheduledDate", newDateTime);
            }}
          />
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
                value={field.value?.toString() || ""}
                onValueChange={(teamId) => {
                  field.onChange([teamId]);
                  const selectedTeam = teams.find((team) => team.id === teamId);
                  if (selectedTeam) {
                    setSelectedTeamMembers(selectedTeam.members);
                  } else {
                    setSelectedTeamMembers([]);
                  }
                }}
                disabled={
                  !["scheduled", "completed", "scheduled-next-year"].includes(
                    watch("status")
                  )
                }
              >
                <SelectTrigger
                  className={cn(
                    watch("status") === JobStatus.Scheduled &&
                      !field.value?.length &&
                      "border-red-500"
                  )}
                >
                  <SelectValue
                    placeholder={
                      watch("status") === JobStatus.Scheduled
                        ? "Team assignment required"
                        : "Select a team"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name || `Team ${team.id}`} ({team.members.length}{" "}
                      members)
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update Job"
            : "Create Job"}
        </Button>
      </div>
    </form>
  );
}
