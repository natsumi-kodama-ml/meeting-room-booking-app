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
      ? "本日はこの後予定なし"
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

      {isOpenSeat ? (
        <OpenDeskIcon className="hidden h-8 w-14 shrink-0 text-amber-700 sm:block dark:text-amber-300" />
      ) : (
        <MeetingTableIcon
          chairs={chairCountFor(room.capacity)}
          className="hidden h-8 w-14 shrink-0 text-sky-700 sm:block dark:text-sky-300"
        />
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

function EntranceStrip() {
  return (
    <div
      style={{ flexGrow: 2.5, flexBasis: 0 }}
      className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-border bg-background text-muted-foreground"
    >
      <DoorOpen className="size-3.5 shrink-0" />
      <span className="text-[11px] font-medium">エントランス・受付</span>
    </div>
  );
}

function UtilityItem({
  icon: Icon,
  label,
}: {
  icon: typeof ElevatorIcon;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span
        className="text-center text-[10px] leading-none font-medium"
        style={{ writingMode: "vertical-rl" }}
      >
        {label}
      </span>
    </div>
  );
}

function OpenWorkspace() {
  return (
    <div
      style={{ flexGrow: 4, flexBasis: 0 }}
      className="flex min-w-0 flex-col gap-1.5 rounded-sm border border-border bg-muted/30 p-2"
    >
      <p className="truncate text-[11px] font-medium text-muted-foreground">
        執務室(フリーアドレス席)
      </p>
      <div className="grid flex-1 grid-cols-3 content-start gap-1.5 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
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
            gridTemplateColumns: "minmax(0, 4fr) minmax(0, 2fr) minmax(0, 7fr)",
            aspectRatio: "16 / 13",
          }}
        >
          {/* 来客スペース: entrance + guest-facing meeting rooms */}
          <div className="flex min-w-0 flex-col gap-2 p-2 pt-8">
            <p className="truncate px-1 text-[11px] font-medium text-muted-foreground">
              来客スペース
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <EntranceStrip />
              {reception.map((room) => {
                const available = isRoomAvailableNow(
                  reservations,
                  room.id,
                  date,
                  nowMinutes
                );
                return (
                  <RoomBox
                    key={room.id}
                    room={room}
                    side="left"
                    available={available}
                    statusLabel={statusLabelFor(
                      reservations,
                      room.id,
                      date,
                      nowMinutes,
                      available
                    )}
                    onSelect={() => onSelectRoom(room.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-muted/40 p-1.5 py-8">
            <UtilityItem icon={ElevatorIcon} label="EV" />
            <UtilityItem icon={Stairs} label="階段" />
            <UtilityItem icon={Toilet} label="トイレ" />
            <UtilityItem icon={Coffee} label="給湯室" />
          </div>

          {/* 執務室エリア: open workspace + enclosed/booking-only rooms */}
          <div className="flex min-w-0 flex-col gap-2 p-2 pt-8">
            <p className="truncate px-1 text-[11px] font-medium text-muted-foreground">
              執務室エリア
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-2 sm:flex-row">
              <OpenWorkspace />
              <div
                style={{ flexGrow: 6, flexBasis: 0 }}
                className="flex min-w-0 flex-col gap-2"
              >
                {office.map((room) => {
                  const available = isRoomAvailableNow(
                    reservations,
                    room.id,
                    date,
                    nowMinutes
                  );
                  return (
                    <RoomBox
                      key={room.id}
                      room={room}
                      side="right"
                      available={available}
                      statusLabel={statusLabelFor(
                        reservations,
                        room.id,
                        date,
                        nowMinutes,
                        available
                      )}
                      onSelect={() => onSelectRoom(room.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="px-1 text-[11px] text-muted-foreground">
        架空のフロアイメージです(部屋の面積・机の数は定員のイメージ、実際の配置とは異なります)
      </p>
    </div>
  );
}
