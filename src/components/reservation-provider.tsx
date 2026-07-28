"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Reservation } from "@/lib/types";
import { createInitialReservations } from "@/lib/mock-reservations";

type ReservationContextValue = {
  reservations: Reservation[];
  addReservation: (input: Omit<Reservation, "id">) => void;
  removeReservation: (id: string) => void;
};

const ReservationContext = createContext<ReservationContextValue | null>(null);

let nextId = 1000;

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    createInitialReservations(new Date())
  );

  const addReservation = useCallback((input: Omit<Reservation, "id">) => {
    const reservation: Reservation = { ...input, id: `res-${nextId++}` };
    setReservations((prev) => [...prev, reservation]);
  }, []);

  const removeReservation = useCallback((id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(
    () => ({ reservations, addReservation, removeReservation }),
    [reservations, addReservation, removeReservation]
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error("useReservations must be used within ReservationProvider");
  }
  return ctx;
}
