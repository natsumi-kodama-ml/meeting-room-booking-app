"use client";

import { useMemo, useState } from "react";
import { Lightning, CalendarBlank, DoorOpen, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ROOMS, getRoomById } from "@/lib/rooms";
import { Reservation } from "@/lib/types";
import { formatDateKey, formatDateLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import { AvailableNowList } from "@/components/mobile/available-now-list";
import { TodayScheduleList } from "@/components/mobile/today-schedule-list";
import { RoomDirectoryList } from "@/components/mobile/room-directory-list";
import { RoomDetail } from "@/components/mobile/room-detail";
import { CurrentUserControl } from "@/components/current-user-control";

type Tab = "now" | "today" | "rooms";

const TABS: { key: Tab; label: string; icon: typeof Lightning }[] = [
  { key: "now", label: "今すぐ", icon: Lightning },
  { key: "today", label: "今日の空き時間", icon: CalendarBlank },
  { key: "rooms", label: "会議室", icon: DoorOpen },
];

type MobileShellProps = {
  reservations: Reservation[];
  onOpenNewBooking: () => void;
  onOpenRoomBooking: (roomId: string) => void;
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (id: string) => void;
};

export function MobileShell({
  reservations,
  onOpenNewBooking,
  onOpenRoomBooking,
  onEditReservation,
  onDeleteReservation,
}: MobileShellProps) {
  const [tab, setTab] = useState<Tab>("now");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const now = new Date();
  const date = formatDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const selectedRoom = useMemo(
    () => (selectedRoomId ? getRoomById(selectedRoomId) : undefined),
    [selectedRoomId]
  );

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="flex items-center justify-between gap-3 border-b border-border/70 bg-card px-4 py-3">
        <div>
          <h1 className="text-base font-semibold leading-tight">会議室予約</h1>
          <p className="text-xs text-muted-foreground">{formatDateLabel(now)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <CurrentUserControl size="sm" />
          <Button size="sm" onClick={onOpenNewBooking} className="gap-1">
            <Plus className="size-3.5" />
            予約する
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {selectedRoom ? (
          <RoomDetail
            room={selectedRoom}
            reservations={reservations}
            date={date}
            dateObj={now}
            nowMinutes={nowMinutes}
            onBack={() => setSelectedRoomId(null)}
            onBook={() => onOpenRoomBooking(selectedRoom.id)}
            onEditReservation={onEditReservation}
            onDeleteReservation={onDeleteReservation}
          />
        ) : (
          <>
            {tab === "now" && (
              <AvailableNowList
                rooms={ROOMS}
                reservations={reservations}
                date={date}
                nowMinutes={nowMinutes}
                onSelectRoom={setSelectedRoomId}
              />
            )}
            {tab === "today" && (
              <TodayScheduleList
                rooms={ROOMS}
                reservations={reservations}
                date={date}
                onSelectRoom={setSelectedRoomId}
              />
            )}
            {tab === "rooms" && (
              <RoomDirectoryList
                rooms={ROOMS}
                reservations={reservations}
                date={date}
                nowMinutes={nowMinutes}
                onSelectRoom={setSelectedRoomId}
              />
            )}
          </>
        )}
      </main>

      {!selectedRoom && (
        <nav className="fixed inset-x-0 bottom-0 flex border-t border-border/70 bg-card">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                tab === key ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" weight={tab === key ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
