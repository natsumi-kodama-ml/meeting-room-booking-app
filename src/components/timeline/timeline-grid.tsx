"use client";

import { useEffect, useRef } from "react";
import { ROOMS, roomLocationLabel } from "@/lib/rooms";
import { Reservation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ReservationChip } from "@/components/timeline/reservation-chip";
import {
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
  SLOT_MINUTES,
  businessHourMarks,
  formatDateKey,
  isSameDate,
  minutesToTime,
  timeToMinutes,
} from "@/lib/time";

const BUSINESS_START_MIN = BUSINESS_START_HOUR * 60;
const BUSINESS_END_MIN = BUSINESS_END_HOUR * 60;
const TOTAL_MIN = BUSINESS_END_MIN - BUSINESS_START_MIN;

// A fixed per-hour pixel width keeps reservation labels readable now that
// the timeline spans the full day — a percentage-based width would let
// each hour column (and every chip in it) shrink as the range widens.
const HOUR_WIDTH = 100;
const TIMELINE_WIDTH = (TOTAL_MIN / 60) * HOUR_WIDTH;
const ROOM_COLUMN_WIDTH = 200;

type TimelineGridProps = {
  date: Date;
  reservations: Reservation[];
  onSlotSelect: (input: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (id: string) => void;
};

export function TimelineGrid({
  date,
  reservations,
  onSlotSelect,
  onEditReservation,
  onDeleteReservation,
}: TimelineGridProps) {
  const dateKey = formatDateKey(date);
  const hourMarks = businessHourMarks();
  const showNowLine = isSameDate(date, new Date());
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const nowPct = ((nowMinutes - BUSINESS_START_MIN) / TOTAL_MIN) * 100;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Open scrolled to the relevant part of the day instead of midnight:
    // "now" when browsing today, otherwise a reasonable start-of-day hour.
    const anchorHour = showNowLine ? Math.max(nowMinutes / 60 - 1, 0) : 8;
    scrollRef.current?.scrollTo({ left: anchorHour * HOUR_WIDTH });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  function handleRowClick(roomId: string, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const rawMinutes = BUSINESS_START_MIN + ratio * TOTAL_MIN;
    const snapped =
      Math.round(rawMinutes / SLOT_MINUTES) * SLOT_MINUTES;
    const startMin = Math.min(
      Math.max(snapped, BUSINESS_START_MIN),
      BUSINESS_END_MIN - SLOT_MINUTES
    );
    const endMin = Math.min(startMin + 60, BUSINESS_END_MIN);

    onSlotSelect({
      roomId,
      date: dateKey,
      startTime: minutesToTime(startMin),
      endTime: minutesToTime(endMin),
    });
  }

  return (
    <div className="rounded-xl bg-card shadow-sm overflow-hidden">
      <div ref={scrollRef} className="overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${ROOM_COLUMN_WIDTH}px ${TIMELINE_WIDTH}px`,
            width: ROOM_COLUMN_WIDTH + TIMELINE_WIDTH,
          }}
        >
          {/* header */}
          <div className="sticky left-0 z-20 flex items-end border-b border-r border-border/70 bg-card p-3 text-sm font-medium text-muted-foreground">
            会議室
          </div>
          <div className="relative h-10 border-b border-border/70">
            {hourMarks.map((h) => {
              const pct = ((h * 60 - BUSINESS_START_MIN) / TOTAL_MIN) * 100;
              return (
                <div
                  key={h}
                  className="absolute top-0 h-full border-l border-border/40 pl-1.5 pt-2 text-xs text-muted-foreground"
                  style={{ left: `${pct}%` }}
                >
                  {h}:00
                </div>
              );
            })}
          </div>

          {/* rows */}
          {ROOMS.map((room) => {
            const roomReservations = reservations.filter(
              (r) => r.roomId === room.id && r.date === dateKey
            );

            return (
              <div key={room.id} className="contents">
                <div className="sticky left-0 z-20 border-b border-r border-border/70 bg-card p-3">
                  <p className="text-sm font-medium leading-tight">{room.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {roomLocationLabel(room)} ・ 定員{room.capacity}名
                  </p>
                  {room.equipment.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {room.equipment.map((eq) => (
                        <Badge key={eq} variant="secondary" className="font-normal">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="relative h-24 border-b border-border/70 cursor-pointer hover:bg-muted/30"
                  onClick={(e) => handleRowClick(room.id, e)}
                >
                  {hourMarks.map((h) => {
                    const pct = ((h * 60 - BUSINESS_START_MIN) / TOTAL_MIN) * 100;
                    return (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-l border-border/30"
                        style={{ left: `${pct}%` }}
                      />
                    );
                  })}
                  {showNowLine && nowPct >= 0 && nowPct <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 z-10 w-px bg-destructive/70"
                      style={{ left: `${nowPct}%` }}
                    />
                  )}
                  {roomReservations.map((r) => {
                    const startMin = timeToMinutes(r.startTime);
                    const endMin = timeToMinutes(r.endTime);
                    const left = ((startMin - BUSINESS_START_MIN) / TOTAL_MIN) * 100;
                    const width = ((endMin - startMin) / TOTAL_MIN) * 100;
                    return (
                      <ReservationChip
                        key={r.id}
                        reservation={r}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onEdit={onEditReservation}
                        onDelete={onDeleteReservation}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
