"use client";

import { CaretRight, MapPin, UsersThree } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/lib/types";
import { Reservation } from "@/lib/types";
import {
  availableUntil,
  isRoomAvailableNow,
} from "@/lib/availability";
import { formatMinutesLabel } from "@/lib/availability";
import { BUSINESS_END_HOUR } from "@/lib/time";

type AvailableNowListProps = {
  rooms: Room[];
  reservations: Reservation[];
  date: string;
  nowMinutes: number;
  onSelectRoom: (roomId: string) => void;
};

export function AvailableNowList({
  rooms,
  reservations,
  date,
  nowMinutes,
  onSelectRoom,
}: AvailableNowListProps) {
  const withinBusinessHours = nowMinutes < BUSINESS_END_HOUR * 60;
  const availableRooms = rooms.filter((room) =>
    isRoomAvailableNow(reservations, room.id, date, nowMinutes)
  );
  const busyRooms = rooms.filter(
    (room) => !isRoomAvailableNow(reservations, room.id, date, nowMinutes)
  );

  if (!withinBusinessHours) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium">営業時間外です</p>
        <p className="text-xs text-muted-foreground">
          会議室の利用時間は 9:00-19:00 です
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-medium text-muted-foreground">
          今空いている部屋({availableRooms.length}件)
        </h2>
        {availableRooms.length === 0 && (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground shadow-sm">
            現在空いている会議室はありません
          </p>
        )}
        {availableRooms.map((room) => {
          const until = availableUntil(reservations, room.id, date, nowMinutes);
          const untilLabel =
            until >= BUSINESS_END_HOUR * 60
              ? "本日はこの後予定なし"
              : `${formatMinutesLabel(until)}まで空いています`;
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 text-left shadow-sm active:bg-muted/40"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-medium leading-tight">{room.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  {room.location}
                  <span className="mx-0.5">・</span>
                  <UsersThree className="size-3.5 shrink-0" />
                  {room.capacity}名
                </p>
                <p className="text-xs font-medium text-primary">{untilLabel}</p>
              </div>
              <CaretRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {busyRooms.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h2 className="text-sm font-medium text-muted-foreground">
            使用中({busyRooms.length}件)
          </h2>
          {busyRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 text-left opacity-70 shadow-sm active:bg-muted/40"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-medium leading-tight">{room.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  {room.location}
                  <span className="mx-0.5">・</span>
                  <UsersThree className="size-3.5 shrink-0" />
                  {room.capacity}名
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 font-normal">
                使用中
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
