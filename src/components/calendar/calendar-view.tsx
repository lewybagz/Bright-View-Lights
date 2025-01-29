import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfDay,
  endOfDay,
  addWeeks,
  eachHourOfInterval,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Job } from "@/types";
import { fetchJobs } from "@/lib/jobs";
import { EnhancedJobView } from "../jobs/job-card";

type CalendarView = "month" | "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  type: string; // We'll use installationType from Job
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState<CalendarView>("month");
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  function jobsToEvents(jobs: Job[]): CalendarEvent[] {
    return jobs.map((job) => ({
      id: job.id,
      title: `${job.customerName} - ${job.location.address}`,
      start:
        job.scheduledDate instanceof Date
          ? job.scheduledDate
          : job.scheduledDate.toDate(),
      type: job.installationType,
    }));
  }

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const { jobs, error } = await fetchJobs();
        if (!error && jobs) {
          // Convert jobs to calendar events
          const calendarEvents = jobsToEvents(jobs);
          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const navigate = (direction: "prev" | "next") => {
    switch (view) {
      case "month":
        setCurrentDate(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + (direction === "next" ? 1 : -1),
            1
          )
        );
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, direction === "next" ? 1 : -1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, direction === "next" ? 1 : -1));
        break;
    }
  };

  const hours = eachHourOfInterval({
    start: startOfDay(currentDate),
    end: endOfDay(currentDate),
  });

  const goToToday = () => setCurrentDate(new Date());

  const getEventsForInterval = (start: Date, end: Date) => {
    return events.filter((event) =>
      isWithinInterval(event.start, { start, end })
    );
  };

  const renderEvent = (event: CalendarEvent, isWeekView: boolean = false) => {
    const startHour = event.start.getHours();

    const handleEventClick = async () => {
      const { jobs } = await fetchJobs();
      const job = jobs.find((j) => j.id === event.id);
      if (job) setSelectedJob(job);
    };

    return (
      <div
        key={event.id}
        onClick={handleEventClick}
        className={cn(
          "absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden cursor-pointer hover:opacity-80",
          event.type === "residential"
            ? "bg-brightview-orange"
            : "bg-brightview-blue"
        )}
        style={{
          top: `${startHour * 60 + event.start.getMinutes()}px`,
          height: "60px",
          ...(isWeekView && { left: "4px", right: "4px" }),
        }}
      >
        <div className="font-semibold">{event.title}</div>
        <div>{format(event.start, "h:mm a")}</div>
      </div>
    );
  };

  const renderMonthView = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    // Get the Sunday before the first day of the month if month doesn't start on Sunday
    const startDate = startOfWeek(firstDayOfMonth);

    // Get the Saturday after the last day of the month if month doesn't end on Saturday
    const endDate = endOfWeek(lastDayOfMonth);

    // Get all days between the calculated start and end dates
    const days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin">Loading Month View...</div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-white p-2 text-sm font-medium text-gray-500 text-center"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForInterval(
            startOfDay(day),
            endOfDay(day)
          );
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "bg-white p-2 min-h-[100px] text-sm border border-gray-100",
                isToday(day) && "bg-blue-50",
                !isCurrentMonth && "text-gray-400 bg-gray-50"
              )}
            >
              <div className="font-medium mb-1">
                {!isCurrentMonth && format(day, "MMM ")}{" "}
                {/* Show month abbrev for non-current month days */}
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={async () => {
                      const { jobs } = await fetchJobs();
                      const job = jobs.find((j) => j.id === event.id);
                      if (job) setSelectedJob(job);
                    }}
                    className={cn(
                      "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80",
                      event.type === "residential"
                        ? "bg-brightview-orange text-white"
                        : "bg-brightview-blue text-white"
                    )}
                  >
                    {format(event.start, "h:mm a")} - {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin">Loading Week view...</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[600px]">
        <div className="grid grid-cols-8 border-b">
          <div className="w-16" /> {/* Time column header */}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center border-l",
                isToday(day) && "bg-blue-50"
              )}
            >
              <div className="text-sm font-medium">{format(day, "EEE")}</div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 h-[1440px]">
            {" "}
            {/* 24 hours * 60px */}
            <div className="border-r">
              {hours.map((hour) => (
                <div
                  key={hour.toISOString()}
                  className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-1"
                >
                  {format(hour, "ha")}
                </div>
              ))}
            </div>
            {days.map((day) => {
              const dayEvents = getEventsForInterval(
                startOfDay(day),
                endOfDay(day)
              );

              return (
                <div key={day.toISOString()} className="border-r relative">
                  {hours.map((hour) => (
                    <div
                      key={hour.toISOString()}
                      className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-1"
                    >
                      {format(hour, "ha")}
                    </div>
                  ))}
                  {dayEvents.map((event) => renderEvent(event, true))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    const events = getEventsForInterval(dayStart, dayEnd);

    return (
      <div className="flex flex-col h-[600px]">
        <div
          className={cn(
            "p-4 border-b text-center",
            isToday(currentDate) && "bg-blue-50"
          )}
        >
          <div className="text-sm font-medium">
            {format(currentDate, "EEEE")}
          </div>
          <div className="text-2xl font-bold">
            {format(currentDate, "MMMM d, yyyy")}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="relative h-[1440px]">
            {" "}
            {/* 24 hours * 60px */}
            {hours.map((hour) => (
              <div
                key={hour.toISOString()}
                className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-1"
              >
                {format(hour, "ha")}
              </div>
            ))}
            {events.map((event) => renderEvent(event))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin">Loading Day View...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        heading="Calendar"
        text="Schedule and manage installation appointments or quote dates"
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1 mr-4">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("day")}
            >
              Day
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      <Card className="flex-1 overflow-hidden">
        <div className="p-4 h-full flex flex-col">
          <div className="text-xl font-semibold mb-4">
            {format(currentDate, view === "day" ? "MMMM d, yyyy" : "MMMM yyyy")}
          </div>

          <div className="flex-1 overflow-hidden">
            {view === "month" && renderMonthView()}
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
          </div>
        </div>
      </Card>
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4">
            <EnhancedJobView
              job={selectedJob}
              onEdit={() => {}}
              onView={() => {}}
              onClose={() => setSelectedJob(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
