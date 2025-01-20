import React from "react";
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

type CalendarView = "month" | "week" | "day";

// Mock events for demonstration
const mockEvents = [
  {
    id: "1",
    title: "Residential Installation",
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 12, 0),
    type: "installation",
  },
  {
    id: "2",
    title: "Commercial Setup",
    start: new Date(2024, 0, 15, 14, 0),
    end: new Date(2024, 0, 15, 16, 0),
    type: "setup",
  },
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState<CalendarView>("month");

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
    return mockEvents.filter(
      (event) =>
        isWithinInterval(event.start, { start, end }) ||
        isWithinInterval(event.end, { start, end })
    );
  };

  const renderEvent = (
    event: (typeof mockEvents)[0],
    isWeekView: boolean = false
  ) => {
    const startHour = event.start.getHours();
    const duration =
      (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);

    return (
      <div
        key={event.id}
        className={cn(
          "absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden",
          event.type === "installation"
            ? "bg-brightview-orange"
            : "bg-brightview-blue"
        )}
        style={{
          top: `${startHour * 60 + event.start.getMinutes()}px`,
          height: `${duration * 60}px`,
          ...(isWeekView && { left: "4px", right: "4px" }),
        }}
      >
        <div className="font-semibold">{event.title}</div>
        <div>
          {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const days = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });

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

        {Array.from({ length: firstDayOfMonth.getDay() }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-white p-2 text-sm text-gray-400"
          />
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForInterval(
            startOfDay(day),
            endOfDay(day)
          );

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "bg-white p-2 min-h-[100px] text-sm border border-gray-100",
                isToday(day) && "bg-blue-50",
                !isSameMonth(day, currentDate) && "text-gray-400"
              )}
            >
              <div className="font-medium mb-1">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded",
                      event.type === "installation"
                        ? "bg-brightview-orange text-white"
                        : "bg-brightview-blue text-white"
                    )}
                  >
                    {event.title}
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
    </div>
  );
}
