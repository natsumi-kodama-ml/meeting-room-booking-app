"use client";

import { CaretRight } from "@phosphor-icons/react";
import { Room, Reservation } from "@/lib/types";
import { freeGaps, reservationsForRoomOnDate } from "@/lib/availability";
import {
  BUSINESS_END_HOUR,
  BUSINESS_START_HOUR,
  timeToMinutes,
} from "@/lib/time";

const BUSINESS_START_MIN = BUSINESS_START_HOUR * 60;
const BUSINESS_END_MIN = BUSINESS_END_HOUR * 60;
const TOTAL_MIN = BUSINESS_END_MIN - BUSINESS_START_MIN;

type TodayScheduleListProps = {
  rooms: Room[];
  reservations: Reservation[];
  date: string;
  onSelectRoom: (roomId: string) => void;
};

export function TodayScheduleList({
  rooms,
  reservations,
  date,
  onSelectRoom,
}: TodayScheduleListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        本日の空き時間({BUSINESS_START_HOUR}:00-{BUSINESS_END_HOUR}:00)
      </h2>
      {rooms.map((room) => {
        const todays = reservationsForRoomOnDate(reservations, room.id, date);
        const gaps = freeGaps(reservations, room.id, date);
        const fullyFree = gaps.length === 1 && todays.length === 0;

        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className="flex flex-col gap-2.5 rounded-xl bg-card p-4 text-left shadow-sm active:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium leading-tight">{room.name}</p>
              <CaretRight className="size-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              {todays.map((r) => {
                const left =
                  ((timeToMinutes(r.startTime) - BUSINESS_START_MIN) / TOTAL_MIN) * 100;
                const width =
                  ((timeToMinutes(r.endTime) - timeToMinutes(r.startTime)) / TOTAL_MIN) * 100;
                return (
                  <span
                    key={r.id}
                    className="absolute top-0 h-full bg-primary"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {fullyFree ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  終日空いています
                </span>
              ) : (
                gaps.map((g) => (
                  <span
                    key={g.start}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {String(Math.floor(g.start / 60)).padStart(2, "0")}:
                    {String(g.start % 60).padStart(2, "0")}-
                    {String(Math.floor(g.end / 60)).padStart(2, "0")}:
                    {String(g.end % 60).padStart(2, "0")} 空き
                  </span>
                ))
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
