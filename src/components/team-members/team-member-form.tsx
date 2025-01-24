// components/team-members/team-member-form.tsx
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TeamMember } from "@/types";
import { Badge } from "../ui/badge";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "installer", "office"] as const),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d{10,}$/, "Phone number must contain only digits"),
  email: z.string().email("Invalid email address"),
  skills: z.array(z.string()),
  status: z.enum(["active", "inactive"] as const),
  hireDate: z.date(),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d{10,}$/, "Phone number must contain only digits"),
    relationship: z.string().min(1, "Relationship is required"),
  }),
});

// Create a type from our schema
export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

// Define available skills
const AVAILABLE_SKILLS = [
  "Residential Installation",
  "Commercial Installation",
  "Customer Service",
  "Project Management",
  "Electrical",
  "Sales",
  "Scheduling",
  "Maintenance",
  "Troubleshooting",
] as const;

interface TeamMemberFormProps {
  initialData?: TeamMember;
  onSubmit: (data: TeamMemberFormData) => Promise<void>;
  onCancel: () => void;
}

export function TeamMemberForm({
  initialData,
  onSubmit,
  onCancel,
}: TeamMemberFormProps) {
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: initialData || {
      status: "active",
      skills: [],
      hireDate: new Date(),
      emergencyContact: {
        name: "",
        phoneNumber: "",
        relationship: "",
      },
    },
  });

  // State for skills management
  const [newSkill, setNewSkill] = useState("");
  const currentSkills = watch("skills");

  // Function to add a new skill
  const handleAddSkill = () => {
    if (newSkill && !currentSkills.includes(newSkill)) {
      setValue("skills", [...currentSkills, newSkill]);
      setNewSkill("");
    }
  };

  // Function to remove a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleFormSubmit = async (data: TeamMemberFormData) => {
    // If we have initialData, we're updating and should include the id
    const submissionData = initialData ? { ...data, id: initialData.id } : data;

    await onSubmit(submissionData);
  };
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="installer">Installer</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" {...register("phoneNumber")} />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Hire Date and Status */}
        <div className="space-y-2">
          <Label>Hire Date</Label>
          <Controller
            name="hireDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Emergency Contact */}
        <div className="col-span-2 space-y-4 border rounded-lg p-4">
          <h3 className="font-medium">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact.name">Contact Name</Label>
              <Input {...register("emergencyContact.name")} />
              {errors.emergencyContact?.name && (
                <p className="text-sm text-red-500">
                  {errors.emergencyContact.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact.phoneNumber">
                Contact Phone
              </Label>
              <Input {...register("emergencyContact.phoneNumber")} />
              {errors.emergencyContact?.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.emergencyContact.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact.relationship">
                Relationship
              </Label>
              <Input {...register("emergencyContact.relationship")} />
              {errors.emergencyContact?.relationship && (
                <p className="text-sm text-red-500">
                  {errors.emergencyContact.relationship.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="col-span-2 space-y-4">
          <Label>Skills</Label>
          <div className="flex gap-2">
            <Select value={newSkill} onValueChange={setNewSkill}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_SKILLS.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAddSkill}>
              Add Skill
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {skill}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">
                {initialData ? "Updating..." : "Creating..."}
              </span>
            </>
          ) : initialData ? (
            "Update Team Member"
          ) : (
            "Create Team Member"
          )}
        </Button>
      </div>
    </form>
  );
}
