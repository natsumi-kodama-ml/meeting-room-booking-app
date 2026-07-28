"use client";

import { useState } from "react";
import { ListBullets, MapTrifold, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ReservationProvider, useReservations } from "@/components/reservation-provider";
import { CurrentUserProvider } from "@/components/current-user-provider";
import { CurrentUserControl } from "@/components/current-user-control";
import { DateNav } from "@/components/timeline/date-nav";
import { TimelineGrid } from "@/components/timeline/timeline-grid";
import { FloorMap } from "@/components/floor-map";
import { BookingDialog } from "@/components/booking/booking-dialog";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { ROOMS } from "@/lib/rooms";
import {
  BUSINESS_END_HOUR,
  BUSINESS_START_HOUR,
  SLOT_MINUTES,
  effectiveNowMinutes,
  formatDateKey,
  minutesToTime,
} from "@/lib/time";
import { Reservation } from "@/lib/types";
import { cn } from "@/lib/utils";

type DesktopView = "timeline" | "map";

type DialogSeed = {
  roomId: string | null;
  date: string;
  startTime: string;
  endTime: string;
};

function defaultSlotForNow(): { startTime: string; endTime: string } {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const businessStart = BUSINESS_START_HOUR * 60;
  const businessEnd = BUSINESS_END_HOUR * 60;
  const snapped = Math.ceil(nowMinutes / SLOT_MINUTES) * SLOT_MINUTES;
  const start = Math.min(Math.max(snapped, businessStart), businessEnd - SLOT_MINUTES);
  const end = Math.min(start + 60, businessEnd);
  return { startTime: minutesToTime(start), endTime: minutesToTime(end) };
}

function BookingApp() {
  const { reservations, addReservation, updateReservation, removeReservation } =
    useReservations();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [desktopView, setDesktopView] = useState<DesktopView>("timeline");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(
    null
  );
  const [seed, setSeed] = useState<DialogSeed>({
    roomId: null,
    date: formatDateKey(new Date()),
    startTime: "10:00",
    endTime: "11:00",
  });

  function openForNewReservation() {
    setEditingReservation(null);
    setSeed({
      roomId: null,
      date: formatDateKey(selectedDate),
      ...defaultSlotForNow(),
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openForSlot(input: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    setEditingReservation(null);
    setSeed(input);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openForRoom(roomId: string) {
    setEditingReservation(null);
    setSeed({
      roomId,
      date: formatDateKey(selectedDate),
      ...defaultSlotForNow(),
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openForEdit(reservation: Reservation) {
    setEditingReservation(reservation);
    setSeed({
      roomId: reservation.roomId,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  return (
    <>
      {/* Desktop / WEB: room x time timeline */}
      <div className="mx-auto hidden w-full max-w-6xl flex-1 flex-col gap-5 px-6 py-8 md:flex">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">会議室予約</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              会議室の空き状況を確認し、そのまま予約できます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CurrentUserControl />
            <Button onClick={openForNewReservation} className="gap-1.5">
              <Plus className="size-4" />
              予約する
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateNav date={selectedDate} onChange={setSelectedDate} />
          <div className="flex w-fit items-center rounded-full bg-muted p-0.5">
            <button
              onClick={() => setDesktopView("timeline")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                desktopView === "timeline"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <ListBullets className="size-3.5" />
              タイムライン
            </button>
            <button
              onClick={() => setDesktopView("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                desktopView === "map"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <MapTrifold className="size-3.5" />
              フロアマップ
            </button>
          </div>
        </div>

        {desktopView === "timeline" ? (
          <TimelineGrid
            date={selectedDate}
            reservations={reservations}
            onSlotSelect={openForSlot}
            onEditReservation={openForEdit}
            onDeleteReservation={removeReservation}
          />
        ) : (
          <FloorMap
            rooms={ROOMS}
            reservations={reservations}
            date={formatDateKey(selectedDate)}
            nowMinutes={effectiveNowMinutes(selectedDate)}
            onSelectRoom={openForRoom}
          />
        )}
      </div>

      {/* Mobile: card-based views */}
      <div className="md:hidden">
        <MobileShell
          reservations={reservations}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          onOpenNewBooking={openForNewReservation}
          onOpenRoomBooking={openForRoom}
          onEditReservation={openForEdit}
          onDeleteReservation={removeReservation}
        />
      </div>

      <BookingDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        seed={seed}
        editing={editingReservation}
        reservations={reservations}
        onConfirm={addReservation}
        onUpdate={updateReservation}
      />
    </>
  );
}

export default function Home() {
  return (
    <CurrentUserProvider>
      <ReservationProvider>
        <BookingApp />
      </ReservationProvider>
    </CurrentUserProvider>
  );
}
