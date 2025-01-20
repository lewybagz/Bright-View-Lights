import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import type { Team } from "@/types";
import { teamSchema } from "@/lib/schemas/team-schema";

interface TeamFormProps {
  initialData?: Partial<Team>;
  onSubmit: (data: z.infer<typeof teamSchema>) => void;
  onCancel: () => void;
}

export function TeamForm({ initialData, onSubmit, onCancel }: TeamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Members</h3>
          {/* Add dynamic team member fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register("members.0.name")} />
                {errors.members?.[0]?.name && (
                  <p className="text-sm text-red-500">
                    {errors.members[0].name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Controller
                  name="members.0.role"
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
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <Input
                  {...register("members.0.skills")}
                  placeholder="Comma-separated skills"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Team Skills</h3>
          <div className="space-y-2">
            <Label>Skills</Label>
            <Input
              {...register("skills")}
              placeholder="Comma-separated team skills"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Team" : "Create Team"}
        </Button>
      </div>
    </form>
  );
}
