"use client";

import { Reservation } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UsersThree } from "@phosphor-icons/react";

type ReservationChipProps = {
  reservation: Reservation;
  style: React.CSSProperties;
};

export function ReservationChip({ reservation, style }: ReservationChipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            style={style}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-1.5 bottom-1.5 rounded-md border-l-[3px] border-primary bg-primary/10 px-2 py-1 overflow-hidden text-left hover:bg-primary/15 transition-colors cursor-default"
          />
        }
      >
        <p className="truncate text-xs font-medium text-foreground">
          {reservation.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {reservation.startTime}-{reservation.endTime}
        </p>
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{reservation.title}</span>
          <span>
            {reservation.startTime} - {reservation.endTime}
          </span>
          <span>予約者: {reservation.organizer}</span>
          <span className="flex items-center gap-1">
            <UsersThree className="size-3" />
            {reservation.attendees}名
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
