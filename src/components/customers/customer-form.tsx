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
import { Textarea } from "../ui/textarea";
import type { Customer } from "@/types";

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contact: z.object({
    phone: z.string().min(10, "Valid phone number required"),
    email: z.string().email("Valid email required"),
    preferredContact: z.enum(["phone", "email"]),
  }),
  address: z.string().min(1, "Address is required"),
  preferences: z.record(z.unknown()),
  notes: z.string(),
});

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: z.infer<typeof customerSchema>) => void | Promise<void>;
  onCancel: () => void;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {initialData?.id && <input type="hidden" {...register("id")} />}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("contact.email")} />
          {errors.contact?.email && (
            <p className="text-sm text-red-500">
              {errors.contact.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("contact.phone")} />
          {errors.contact?.phone && (
            <p className="text-sm text-red-500">
              {errors.contact.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
          <Controller
            name="contact.preferredContact"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
