"use client";

import { DoorOpen, UsersThree } from "@phosphor-icons/react";
import { Room, Reservation } from "@/lib/types";
import { isRoomAvailableNow } from "@/lib/availability";
import { cn } from "@/lib/utils";

type FloorMapProps = {
  rooms: Room[];
  reservations: Reservation[];
  date: string;
  nowMinutes: number;
  onSelectRoom: (roomId: string) => void;
};

const ZONES = [
  { key: "来客スペース", match: "来客スペース" },
  { key: "執務室エリア", match: "執務室内" },
] as const;

function RoomBox({
  room,
  available,
  onSelect,
}: {
  room: Room;
  available: boolean;
  onSelect: () => void;
}) {
  const isOpenSeat = room.location.includes("オープン");

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex min-w-[9rem] flex-1 flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        isOpenSeat ? "border-dashed" : "border-solid",
        available
          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
          : "border-border bg-muted/50 hover:bg-muted"
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{room.name}</p>
        <span
          className={cn(
            "mt-1 size-2 shrink-0 rounded-full",
            available ? "bg-primary" : "bg-muted-foreground/50"
          )}
        />
      </div>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {isOpenSeat ? (
          <span className="inline-block size-3 shrink-0" />
        ) : (
          <DoorOpen className="size-3 shrink-0" />
        )}
        <UsersThree className="size-3 shrink-0" />
        {room.capacity}名
      </p>
    </button>
  );
}

export function FloorMap({
  rooms,
  reservations,
  date,
  nowMinutes,
  onSelectRoom,
}: FloorMapProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          4Fフロアマップ(イメージ)
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary" />
            空き
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-muted-foreground/50" />
            使用中
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-card p-3 shadow-sm">
        {ZONES.map((zone, i) => {
          const zoneRooms = rooms.filter((r) => r.location.includes(zone.match));
          if (zoneRooms.length === 0) return null;
          return (
            <div key={zone.key} className="flex flex-col gap-2">
              <p className="px-1 text-[11px] font-medium text-muted-foreground">
                {zone.key}
              </p>
              <div className="flex flex-wrap gap-2">
                {zoneRooms.map((room) => (
                  <RoomBox
                    key={room.id}
                    room={room}
                    available={isRoomAvailableNow(reservations, room.id, date, nowMinutes)}
                    onSelect={() => onSelectRoom(room.id)}
                  />
                ))}
              </div>
              {i < ZONES.length - 1 && (
                <div className="my-1 h-px w-full bg-border/70" />
              )}
            </div>
          );
        })}
      </div>
      <p className="px-1 text-[11px] text-muted-foreground">
        実際のフロア配置とは異なる簡易イメージです
      </p>
    </div>
  );
}
