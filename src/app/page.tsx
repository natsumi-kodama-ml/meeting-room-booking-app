"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ReservationProvider, useReservations } from "@/components/reservation-provider";
import { DateNav } from "@/components/timeline/date-nav";
import { TimelineGrid } from "@/components/timeline/timeline-grid";
import { BookingDialog } from "@/components/booking/booking-dialog";
import { MobileShell } from "@/components/mobile/mobile-shell";
import {
  BUSINESS_END_HOUR,
  BUSINESS_START_HOUR,
  SLOT_MINUTES,
  formatDateKey,
  minutesToTime,
} from "@/lib/time";

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
  const { reservations, addReservation } = useReservations();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [seed, setSeed] = useState<DialogSeed>({
    roomId: null,
    date: formatDateKey(new Date()),
    startTime: "10:00",
    endTime: "11:00",
  });

  function openForNewReservation() {
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
    setSeed(input);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openForRoomToday(roomId: string) {
    setSeed({
      roomId,
      date: formatDateKey(new Date()),
      ...defaultSlotForNow(),
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
          <Button onClick={openForNewReservation} className="gap-1.5">
            <Plus className="size-4" />
            予約する
          </Button>
        </header>

        <DateNav date={selectedDate} onChange={setSelectedDate} />

        <TimelineGrid
          date={selectedDate}
          reservations={reservations}
          onSlotSelect={openForSlot}
        />
      </div>

      {/* Mobile: card-based views */}
      <div className="md:hidden">
        <MobileShell
          reservations={reservations}
          onOpenNewBooking={openForNewReservation}
          onOpenRoomBooking={openForRoomToday}
        />
      </div>

      <BookingDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        seed={seed}
        reservations={reservations}
        onConfirm={addReservation}
      />
    </>
  );
}

export default function Home() {
  return (
    <ReservationProvider>
      <BookingApp />
    </ReservationProvider>
  );
}
