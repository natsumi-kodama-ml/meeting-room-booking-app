"use client";

import { CaretLeft, MapPin, Plus, UsersThree } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Room, Reservation } from "@/lib/types";
import { reservationsForRoomOnDate, currentReservation } from "@/lib/availability";
import { RoomStatusBadge } from "@/components/mobile/room-status-badge";
import { isRoomAvailableNow } from "@/lib/availability";
import { formatDateLabel } from "@/lib/time";

type RoomDetailProps = {
  room: Room;
  reservations: Reservation[];
  date: string;
  dateObj: Date;
  nowMinutes: number;
  onBack: () => void;
  onBook: () => void;
};

export function RoomDetail({
  room,
  reservations,
  date,
  dateObj,
  nowMinutes,
  onBack,
  onBook,
}: RoomDetailProps) {
  const todays = reservationsForRoomOnDate(reservations, room.id, date);
  const available = isRoomAvailableNow(reservations, room.id, date, nowMinutes);
  const ongoing = currentReservation(reservations, room.id, date, nowMinutes);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <CaretLeft className="size-4" />
        戻る
      </button>

      <div className="flex flex-col gap-2 rounded-xl bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-lg font-semibold leading-tight">{room.name}</h1>
          <RoomStatusBadge available={available} />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {room.location}
          <span className="mx-0.5">・</span>
          <UsersThree className="size-4 shrink-0" />
          定員{room.capacity}名
        </p>
        {room.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.equipment.map((eq) => (
              <Badge key={eq} variant="secondary" className="font-normal">
                {eq}
              </Badge>
            ))}
          </div>
        )}
        {ongoing && (
          <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            現在使用中: {ongoing.title}({ongoing.startTime}-{ongoing.endTime})
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {formatDateLabel(dateObj)}の予定
        </h2>
        {todays.length === 0 ? (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground shadow-sm">
            本日の予定はありません
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border/70 rounded-xl bg-card px-4 shadow-sm">
            {todays.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    予約者: {r.organizer} ・ {r.attendees}名
                  </p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {r.startTime}-{r.endTime}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={onBook} className="mt-1 gap-1.5">
        <Plus className="size-4" />
        この会議室を予約する
      </Button>
    </div>
  );
}
