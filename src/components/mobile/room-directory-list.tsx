"use client";

import { CaretRight, MapPin, UsersThree } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Room, Reservation } from "@/lib/types";
import { isRoomAvailableNow } from "@/lib/availability";
import { RoomStatusBadge } from "@/components/mobile/room-status-badge";

type RoomDirectoryListProps = {
  rooms: Room[];
  reservations: Reservation[];
  date: string;
  nowMinutes: number;
  onSelectRoom: (roomId: string) => void;
};

export function RoomDirectoryList({
  rooms,
  reservations,
  date,
  nowMinutes,
  onSelectRoom,
}: RoomDirectoryListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        会議室一覧({rooms.length}件)
      </h2>
      {rooms.map((room) => {
        const available = isRoomAvailableNow(reservations, room.id, date, nowMinutes);
        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 text-left shadow-sm active:bg-muted/40"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="font-medium leading-tight">{room.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {room.location}
                <span className="mx-0.5">・</span>
                <UsersThree className="size-3.5 shrink-0" />
                {room.capacity}名
              </p>
              {room.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {room.equipment.map((eq) => (
                    <Badge key={eq} variant="secondary" className="font-normal">
                      {eq}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <RoomStatusBadge available={available} />
              <CaretRight className="size-4 text-muted-foreground" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
