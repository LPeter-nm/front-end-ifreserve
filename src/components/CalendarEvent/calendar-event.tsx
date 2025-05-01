interface CalendarEventProps {
  event: {
    id: number;
    title: string;
    day: number;
    startTime: string;
    endTime: string;
    color: string;
  };
}

export function CalendarEvent({ event }: CalendarEventProps) {
  return (
    <div className={`${event.color} p-1 h-full rounded text-sm overflow-hidden text-center`}>
      <div className="font-medium">{event.title}</div>
      <div className="text-xs">
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
}
