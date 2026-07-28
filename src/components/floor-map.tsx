"use client";

import { DoorOpen, ElevatorIcon, MapPin, UsersThree } from "@phosphor-icons/react";
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

function MeetingTableIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      <rect x="16" y="12" width="32" height="16" rx="3" fill="currentColor" opacity="0.18" />
      <rect
        x="16"
        y="12"
        width="32"
        height="16"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {[14, 26, 38, 50].map((cx) => (
        <circle key={`t-${cx}`} cx={cx} cy="4" r="3.5" fill="currentColor" opacity="0.4" />
      ))}
      {[14, 26, 38, 50].map((cx) => (
        <circle key={`b-${cx}`} cx={cx} cy="36" r="3.5" fill="currentColor" opacity="0.4" />
      ))}
    </svg>
  );
}

function OpenDeskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      {[
        [4, 4],
        [34, 4],
        [4, 22],
        [34, 22],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="26"
          height="14"
          rx="2"
          fill="currentColor"
          opacity="0.18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
      ))}
    </svg>
  );
}

function RoomBox({
  room,
  available,
  side,
  onSelect,
}: {
  room: Room;
  available: boolean;
  side: "left" | "right";
  onSelect: () => void;
}) {
  const isOpenSeat = room.location.includes("オープン");
  const grow = Math.max(room.capacity, 4);

  return (
    <button
      onClick={onSelect}
      style={{ flexGrow: grow, flexBasis: 0 }}
      className={cn(
        "group relative flex min-h-16 w-full min-w-0 items-center justify-between gap-2 border-2 p-2.5 pt-4 text-left transition-colors sm:p-3 sm:pt-5",
        isOpenSeat ? "border-dashed" : "border-solid",
        isOpenSeat
          ? "bg-amber-50 dark:bg-amber-950/20"
          : "bg-sky-50 dark:bg-sky-950/20",
        available
          ? "border-primary/50 hover:brightness-95 dark:hover:brightness-125"
          : "border-foreground/25 opacity-80 hover:opacity-100"
      )}
    >
      {/* pin marker, dropped on the room like a map pin */}
      <span
        aria-hidden
        className={cn(
          "absolute -top-3 left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border-2 text-white shadow-sm",
          available
            ? "border-primary-foreground/40 bg-primary"
            : "border-card bg-muted-foreground/70"
        )}
      >
        <MapPin weight="fill" className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium leading-tight">{room.name}</p>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <UsersThree className="size-3 shrink-0" />
          定員{room.capacity}名
        </p>
        <p
          className={cn(
            "text-[11px] font-medium",
            available ? "text-primary" : "text-muted-foreground"
          )}
        >
          {available ? "空いています" : "使用中"}
        </p>
      </div>

      {isOpenSeat ? (
        <OpenDeskIcon className="hidden h-8 w-14 shrink-0 text-amber-700 sm:block dark:text-amber-300" />
      ) : (
        <MeetingTableIcon className="hidden h-8 w-14 shrink-0 text-sky-700 sm:block dark:text-sky-300" />
      )}

      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-card text-muted-foreground",
          side === "left" ? "-right-2.5" : "-left-2.5",
          isOpenSeat ? "border-dashed" : "border-solid",
          available ? "border-primary/50" : "border-foreground/25"
        )}
      >
        {!isOpenSeat && <DoorOpen className="size-3" />}
      </span>
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
  const reception = rooms.filter((r) => r.location.includes("来客スペース"));
  const office = rooms.filter((r) => r.location.includes("執務室内"));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          フロアマップ(イメージ)
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin weight="fill" className="size-3.5 text-primary" />
            空き
          </span>
          <span className="flex items-center gap-1">
            <MapPin weight="fill" className="size-3.5 text-muted-foreground/70" />
            使用中
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border-2 border-foreground/40 bg-card">
        <span className="absolute left-2 top-2 z-10 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
          4F
        </span>
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: "minmax(0, 5fr) minmax(0, 1fr) minmax(0, 6fr)",
            aspectRatio: "16 / 11",
          }}
        >
          <div className="flex flex-col gap-2 p-2 pt-8">
            {reception.map((room) => (
              <RoomBox
                key={room.id}
                room={room}
                side="left"
                available={isRoomAvailableNow(reservations, room.id, date, nowMinutes)}
                onSelect={() => onSelectRoom(room.id)}
              />
            ))}
          </div>

          <div className="flex flex-col items-center justify-between bg-muted/40 py-3">
            <ElevatorIcon className="size-4 text-muted-foreground" />
            <span
              className="text-[11px] tracking-widest text-muted-foreground"
              style={{ writingMode: "vertical-rl" }}
            >
              廊下
            </span>
            <DoorOpen className="size-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col gap-2 p-2 pt-8">
            {office.map((room) => (
              <RoomBox
                key={room.id}
                room={room}
                side="right"
                available={isRoomAvailableNow(reservations, room.id, date, nowMinutes)}
                onSelect={() => onSelectRoom(room.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="px-1 text-[11px] text-muted-foreground">
        実際のフロア配置とは異なる簡易イメージです(面積は定員のイメージ)
      </p>
    </div>
  );
}
