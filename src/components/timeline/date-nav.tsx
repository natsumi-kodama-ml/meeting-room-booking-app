"use client";

import { CaretLeft, CaretRight, CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, formatDateLabel, isSameDate } from "@/lib/time";

type DateNavProps = {
  date: Date;
  onChange: (date: Date) => void;
};

export function DateNav({ date, onChange }: DateNavProps) {
  const today = new Date();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSameDate(date, today) ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(today)}
      >
        今日
      </Button>
      <div className="flex items-center rounded-md border border-border">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-r-none"
          aria-label="前の日"
          onClick={() => onChange(addDays(date, -1))}
        >
          <CaretLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-l-none"
          aria-label="次の日"
          onClick={() => onChange(addDays(date, 1))}
        >
          <CaretRight className="size-4" />
        </Button>
      </div>
      <Popover>
        <PopoverTrigger
          render={<Button variant="outline" size="sm" className="gap-2 font-medium" />}
        >
          <CalendarBlank className="size-4 text-muted-foreground" />
          {formatDateLabel(date)}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onChange(d)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
