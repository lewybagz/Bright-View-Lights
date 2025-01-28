// DateTimeSelector.tsx
import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface DateTimeSelectorProps {
  date: Date | undefined;
  onDateTimeChange: (newDateTime: Date | undefined) => void;
  className?: string;
}

export function DateTimeSelector({
  date,
  onDateTimeChange,
  className,
}: DateTimeSelectorProps) {
  // Generate time slots from 7 AM to 7 PM in 30-minute intervals
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 7; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push(time);
      }
    }
    return slots;
  }, []);

  // Handle time selection
  const handleTimeSelect = (timeString: string) => {
    if (!date) return;

    const [hours, minutes] = timeString.split(":").map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours, minutes, 0, 0);
    onDateTimeChange(newDateTime);
  };

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onDateTimeChange(undefined);
      return;
    }

    if (date) {
      // Preserve existing time if we have one
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    } else {
      // Default to 9:00 AM for new dates
      newDate.setHours(9, 0, 0, 0);
    }
    onDateTimeChange(newDate);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Scheduled Date & Time</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "EEEE, MMM d, yyyy")
              ) : (
                <span>Select date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                console.log("Date selected:", selectedDate);
                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  // Preserve hours/minutes if already selected
                  if (date) {
                    newDate.setHours(date.getHours(), date.getMinutes());
                  } else {
                    newDate.setHours(9, 0); // Default 9 AM
                  }
                  handleDateSelect(newDate);
                }
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
              fromDate={new Date()} // Only allow dates from today onwards
            />
          </PopoverContent>
        </Popover>

        <Select
          value={date ? format(date, "HH:mm") : ""}
          onValueChange={handleTimeSelect}
          disabled={!date}
        >
          <SelectTrigger
            className={cn("w-[150px]", !date && "text-muted-foreground")}
          >
            <Clock className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent className="h-[300px]">
            {timeSlots.map((time) => (
              <SelectItem
                key={format(time, "HH:mm")}
                value={format(time, "HH:mm")}
              >
                {format(time, "h:mm aa")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
