"use client";

import {
  Coffee,
  DoorOpen,
  ElevatorIcon,
  MapPin,
  Package,
  Stairs,
  Toilet,
  UsersThree,
} from "@phosphor-icons/react";
import { Room, Reservation } from "@/lib/types";
import {
  availableUntil,
  currentReservation,
  formatMinutesLabel,
  isRoomAvailableNow,
} from "@/lib/availability";
import { BUSINESS_END_HOUR } from "@/lib/time";
import { cn } from "@/lib/utils";

function statusLabelFor(
  reservations: Reservation[],
  roomId: string,
  date: string,
  nowMinutes: number,
  available: boolean
): string {
  if (available) {
    const until = availableUntil(reservations, roomId, date, nowMinutes);
    return until >= BUSINESS_END_HOUR * 60
      ? "この後の予定なし"
      : `${formatMinutesLabel(until)}まで空いています`;
  }
  const ongoing = currentReservation(reservations, roomId, date, nowMinutes);
  return ongoing ? `${ongoing.endTime}まで使用中` : "使用中";
}

type FloorMapProps = {
  rooms: Room[];
  reservations: Reservation[];
  date: string;
  nowMinutes: number;
  onSelectRoom: (roomId: string) => void;
};

function chairCountFor(capacity: number) {
  if (capacity <= 2) return 2;
  if (capacity <= 6) return 4;
  if (capacity <= 10) return 6;
  return 8;
}

function MeetingTableIcon({
  chairs,
  className,
}: {
  chairs: number;
  className?: string;
}) {
  const perSide = chairs / 2;
  const xs = Array.from({ length: perSide }, (_, i) => 10 + (i * 44) / Math.max(perSide - 1, 1));

  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      <rect x="14" y="12" width="36" height="16" rx="3" fill="currentColor" opacity="0.18" />
      <rect
        x="14"
        y="12"
        width="36"
        height="16"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {xs.map((cx) => (
        <circle key={`t-${cx}`} cx={cx} cy="4" r="3.5" fill="currentColor" opacity="0.4" />
      ))}
      {xs.map((cx) => (
        <circle key={`b-${cx}`} cx={cx} cy="36" r="3.5" fill="currentColor" opacity="0.4" />
      ))}
    </svg>
  );
}

function BoothIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      <rect x="4" y="6" width="10" height="28" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="50" y="6" width="10" height="28" rx="2" fill="currentColor" opacity="0.22" />
      <rect
        x="18"
        y="15"
        width="28"
        height="10"
        rx="2"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

function RoomBox({
  room,
  available,
  statusLabel,
  side,
  onSelect,
}: {
  room: Room;
  available: boolean;
  statusLabel: string;
  side: "left" | "right";
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{ minHeight: `${64 + room.capacity * 5}px` }}
      className={cn(
        "group relative flex w-full min-w-0 flex-1 items-center justify-between gap-2 border-2 border-solid p-3 pt-5 text-left shadow-sm transition-colors",
        "bg-sky-50 dark:bg-sky-950/20",
        available
          ? "border-primary/50 hover:brightness-95 dark:hover:brightness-125"
          : "border-foreground/25 opacity-80 hover:opacity-100"
      )}
    >
      {/* pin marker, dropped on the room like a map pin */}
      <span
        aria-hidden
        className={cn(
          "absolute -top-3 left-1/2 z-10 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border-2 text-white shadow-sm",
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
            "truncate text-[11px] font-medium",
            available ? "text-primary" : "text-muted-foreground"
          )}
        >
          {statusLabel}
        </p>
      </div>

      <MeetingTableIcon
        chairs={chairCountFor(room.capacity)}
        className="h-8 w-14 shrink-0 text-sky-700 dark:text-sky-300"
      />

      {/* door notch, on the wall facing the corridor */}
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-card text-muted-foreground sm:flex",
          side === "left" ? "-right-2.5" : "-left-2.5",
          available ? "border-primary/50" : "border-foreground/25"
        )}
      >
        <DoorOpen className="size-3" />
      </span>
    </button>
  );
}

function EntranceStrip() {
  return (
    <div className="flex min-h-12 w-full flex-1 items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-background text-muted-foreground">
      <DoorOpen className="size-3.5 shrink-0" />
      <span className="text-[11px] font-medium">エントランス・受付</span>
    </div>
  );
}

function UtilityRoom({
  icon: Icon,
  label,
}: {
  icon: typeof ElevatorIcon;
  label: string;
}) {
  return (
    <div className="flex min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-md border border-border bg-background p-2.5 text-muted-foreground sm:min-w-0 sm:rounded-sm">
      <Icon className="size-4 shrink-0" />
      <span className="text-center text-[10px] leading-tight font-medium sm:leading-none sm:[writing-mode:vertical-rl] sm:tracking-wide">
        {label}
      </span>
    </div>
  );
}

function BoothSeat({
  room,
  available,
  statusLabel,
  onSelect,
}: {
  room: Room;
  available: boolean;
  statusLabel: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-center justify-between gap-2 rounded-md border-2 border-dashed p-2.5 pt-4 text-left shadow-sm transition-colors",
        "bg-amber-50 dark:bg-amber-950/20",
        available
          ? "border-primary/50 hover:brightness-95 dark:hover:brightness-125"
          : "border-foreground/25 opacity-80 hover:opacity-100"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute -top-3 left-1/2 z-10 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border-2 text-white shadow-sm",
          available
            ? "border-primary-foreground/40 bg-primary"
            : "border-card bg-muted-foreground/70"
        )}
      >
        <MapPin weight="fill" className="size-3.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-xs font-medium leading-tight">{room.name}</p>
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <UsersThree className="size-3 shrink-0" />
          定員{room.capacity}名 ・ ボックス席
        </p>
        <p
          className={cn(
            "truncate text-[10px] font-medium",
            available ? "text-primary" : "text-muted-foreground"
          )}
        >
          {statusLabel}
        </p>
      </div>
      <BoothIcon className="h-6 w-12 shrink-0 text-amber-700 dark:text-amber-300" />
    </button>
  );
}

function OpenWorkspace({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-md border border-border bg-muted/30 p-2.5">
      <p className="truncate text-[11px] font-medium text-muted-foreground">
        執務室(フリーアドレス席)
      </p>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/2] rounded-[2px] border border-foreground/20 bg-foreground/[0.06]"
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-2 py-1.5 text-muted-foreground">
        <Package className="size-3.5 shrink-0" />
        <span className="text-[11px] font-medium">倉庫・備品庫</span>
      </div>
      {children}
    </div>
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
  const officeRooms = rooms.filter(
    (r) => r.location.includes("執務室内") && !r.location.includes("オープン")
  );
  const boothSeat = rooms.find((r) => r.location.includes("オープン"));

  function statusFor(room: Room) {
    const available = isRoomAvailableNow(reservations, room.id, date, nowMinutes);
    return {
      available,
      statusLabel: statusLabelFor(reservations, room.id, date, nowMinutes, available),
    };
  }

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

      <div className="relative w-full overflow-visible rounded-lg border-2 border-foreground/40 bg-card p-3 pt-9 sm:overflow-hidden sm:p-0">
        <span className="absolute left-2 top-2 z-10 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
          4F
        </span>

        <div className="flex flex-col gap-5 sm:grid sm:aspect-[16/13] sm:grid-cols-[minmax(0,4fr)_minmax(0,2fr)_minmax(0,7fr)] sm:gap-0">
          {/* 来客スペース: entrance + guest-facing meeting rooms */}
          <div className="flex min-w-0 flex-col gap-2 sm:gap-2 sm:p-2 sm:pt-8">
            <p className="truncate px-1 text-[11px] font-medium text-muted-foreground">
              来客スペース
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <EntranceStrip />
              {reception.map((room) => {
                const { available, statusLabel } = statusFor(room);
                return (
                  <RoomBox
                    key={room.id}
                    room={room}
                    side="left"
                    available={available}
                    statusLabel={statusLabel}
                    onSelect={() => onSelectRoom(room.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* 共用部: circulation core, shown as small rooms off the corridor */}
          <div className="flex flex-row flex-wrap justify-center gap-2 rounded-md border border-border/60 bg-muted/20 p-2 sm:flex-col sm:flex-nowrap sm:justify-between sm:rounded-none sm:border-0 sm:border-x sm:border-border/60 sm:bg-muted/20 sm:p-1.5 sm:py-8">
            <UtilityRoom icon={ElevatorIcon} label="EV" />
            <UtilityRoom icon={Stairs} label="階段" />
            <UtilityRoom icon={Toilet} label="トイレ" />
            <UtilityRoom icon={Coffee} label="給湯室" />
          </div>

          {/* 執務室エリア: open workspace (with an embedded box-seat nook) + enclosed meeting rooms */}
          <div className="flex min-w-0 flex-col gap-2 sm:gap-2 sm:p-2 sm:pt-8">
            <p className="truncate px-1 text-[11px] font-medium text-muted-foreground">
              執務室エリア
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-3 sm:flex-row">
              <OpenWorkspace>
                {boothSeat &&
                  (() => {
                    const { available, statusLabel } = statusFor(boothSeat);
                    return (
                      <BoothSeat
                        room={boothSeat}
                        available={available}
                        statusLabel={statusLabel}
                        onSelect={() => onSelectRoom(boothSeat.id)}
                      />
                    );
                  })()}
              </OpenWorkspace>
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-[1.4]">
                {officeRooms.map((room) => {
                  const { available, statusLabel } = statusFor(room);
                  return (
                    <RoomBox
                      key={room.id}
                      room={room}
                      side="right"
                      available={available}
                      statusLabel={statusLabel}
                      onSelect={() => onSelectRoom(room.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
