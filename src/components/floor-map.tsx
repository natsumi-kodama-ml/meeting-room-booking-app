"use client";

import { useRef } from "react";
import {
  Armchair,
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
      style={{ minHeight: `${64 + room.capacity * 5}px`, flexGrow: room.capacity }}
      className={cn(
        "group relative flex w-full min-w-0 items-center justify-between gap-2 border-2 border-solid p-3 pt-5 text-left shadow-sm transition-colors",
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
          "absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-card text-muted-foreground",
          side === "left" ? "-right-2.5" : "-left-2.5",
          available ? "border-primary/50" : "border-foreground/25"
        )}
      >
        <DoorOpen className="size-3" />
      </span>
    </button>
  );
}

/** Open lounge seating in the guest area, alongside the bookable rooms. */
function WaitingLounge() {
  return (
    <div
      style={{ minHeight: "80px", flexGrow: 6 }}
      className="flex w-full min-w-0 flex-col items-center justify-center gap-2 rounded-md border border-border bg-muted/30 p-3 text-muted-foreground"
    >
      <div className="flex items-center gap-2.5">
        <Armchair className="size-5" />
        <Armchair className="size-5" />
        <Armchair className="size-5" />
      </div>
      <span className="text-[11px] font-medium">待合スペース</span>
    </div>
  );
}

function EntranceStrip() {
  return (
    <div className="flex min-h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-background text-muted-foreground">
      <DoorOpen className="size-3.5 shrink-0" />
      <span className="text-[11px] font-medium">エントランス・受付</span>
    </div>
  );
}

/** Small solid-color icon badge, like building-directory signage (EV / restroom / etc). */
function UtilityBadge({
  icon: Icon,
  label,
  colorClass,
}: {
  icon: typeof ElevatorIcon;
  label: string;
  colorClass: string;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg text-white shadow-sm",
          colorClass
        )}
      >
        <Icon weight="fill" className="size-5" />
      </div>
      <span className="text-center text-[9px] leading-none font-medium text-muted-foreground">
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

/** One desk pod/cluster, separated from neighboring pods by an aisle. */
function DeskBlock({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-sm bg-background/60 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/2] min-w-8 rounded-[3px] border border-foreground/20 bg-foreground/[0.06]"
        />
      ))}
    </div>
  );
}

function OpenWorkspace({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{ minHeight: "260px" }}
      className="flex min-w-0 flex-1 self-start flex-col gap-2.5 rounded-md border border-border bg-muted/30 p-3"
    >
      <p className="truncate text-[11px] font-medium text-muted-foreground">
        執務室(フリーアドレス席・18席)
      </p>
      <div className="flex flex-wrap gap-3">
        <DeskBlock count={6} />
        <DeskBlock count={6} />
        <DeskBlock count={6} />
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
  const reception = rooms.filter((r) => r.area === "来客スペース");
  const officeRooms = rooms.filter(
    (r) => r.area === "執務室内" && r.roomType !== "オープン"
  );
  const boothSeat = rooms.find((r) => r.roomType === "オープン");

  const receptionRef = useRef<HTMLDivElement>(null);
  const officeRef = useRef<HTMLDivElement>(null);

  function scrollToSection(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

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

      {/*
        The floor plan keeps one fixed spatial layout (rooms flanking a
        central corridor) at every screen size, instead of restacking into
        a column order on narrow screens — restacking breaks the "room sits
        next to the corridor, with a door onto it" relationship. On phones,
        this scrolls horizontally rather than reflowing.
      */}
      {/* mobile-only: jump straight to a section instead of dragging across the whole map */}
      <div className="flex gap-1.5 md:hidden">
        <button
          type="button"
          onClick={() => scrollToSection(receptionRef)}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground active:bg-muted/60"
        >
          来客スペース
        </button>
        <button
          type="button"
          onClick={() => scrollToSection(officeRef)}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground active:bg-muted/60"
        >
          執務室エリア
        </button>
      </div>

      <div className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth">
        <div className="relative min-w-[720px] rounded-lg border-2 border-foreground/40 bg-card">
          <span className="absolute left-2 top-2 z-10 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
            4F
          </span>

          <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,2fr)_minmax(0,7fr)]">
            {/* 来客スペース: guest-facing meeting rooms */}
            <div ref={receptionRef} className="flex min-w-0 snap-start flex-col gap-2 p-2 pt-9">
              <p className="truncate px-1 text-[11px] font-medium text-muted-foreground">
                来客スペース
              </p>
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <WaitingLounge />
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

            {/* 廊下: EV/stairs is how people arrive on this floor, entrance/reception comes right after; restroom/pantry pushed to the far end, away from the entrance */}
            <div className="flex snap-start flex-col items-center gap-4 border-x border-border/60 bg-background py-6">
              <div className="grid grid-cols-2 gap-2">
                <UtilityBadge icon={ElevatorIcon} label="EV" colorClass="bg-slate-600" />
                <UtilityBadge icon={Stairs} label="階段" colorClass="bg-slate-500" />
              </div>
              <EntranceStrip />
              <div className="flex w-full flex-1 flex-col items-center gap-2">
                <span
                  className="text-[10px] tracking-[0.3em] text-muted-foreground"
                  style={{ writingMode: "vertical-rl" }}
                >
                  廊下
                </span>
                <div className="w-px flex-1 border-l border-dashed border-border/70" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <UtilityBadge icon={Coffee} label="給湯室" colorClass="bg-emerald-600" />
                <UtilityBadge icon={Toilet} label="トイレ" colorClass="bg-sky-500" />
              </div>
            </div>

            {/* 執務室エリア: open workspace (with an embedded box-seat nook) + enclosed meeting rooms */}
            <div ref={officeRef} className="flex min-w-0 snap-start flex-col gap-2 p-2 pt-9">
              <p className="truncate px-1 text-[11px] font-medium text-muted-foreground">
                執務室エリア
              </p>
              <div className="flex min-h-0 flex-1 gap-3">
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
                <div className="flex min-w-0 flex-1 flex-[1.4] flex-col gap-3">
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
    </div>
  );
}
