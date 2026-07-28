import { Reservation } from "./types";
import {
  BUSINESS_END_HOUR,
  BUSINESS_START_HOUR,
  minutesToTime,
  timeToMinutes,
} from "./time";

const BUSINESS_START_MIN = BUSINESS_START_HOUR * 60;
const BUSINESS_END_MIN = BUSINESS_END_HOUR * 60;

export function reservationsForRoomOnDate(
  reservations: Reservation[],
  roomId: string,
  date: string
): Reservation[] {
  return reservations
    .filter((r) => r.roomId === roomId && r.date === date)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

export function currentReservation(
  reservations: Reservation[],
  roomId: string,
  date: string,
  nowMinutes: number
): Reservation | undefined {
  return reservationsForRoomOnDate(reservations, roomId, date).find(
    (r) => timeToMinutes(r.startTime) <= nowMinutes && nowMinutes < timeToMinutes(r.endTime)
  );
}

export function nextReservationAfter(
  reservations: Reservation[],
  roomId: string,
  date: string,
  nowMinutes: number
): Reservation | undefined {
  return reservationsForRoomOnDate(reservations, roomId, date).find(
    (r) => timeToMinutes(r.startTime) >= nowMinutes
  );
}

export function isRoomAvailableNow(
  reservations: Reservation[],
  roomId: string,
  date: string,
  nowMinutes: number
): boolean {
  if (nowMinutes < BUSINESS_START_MIN || nowMinutes >= BUSINESS_END_MIN) {
    return false;
  }
  return !currentReservation(reservations, roomId, date, nowMinutes);
}

/** For an available room right now: minutes-since-midnight of when it becomes busy again, or business end. */
export function availableUntil(
  reservations: Reservation[],
  roomId: string,
  date: string,
  nowMinutes: number
): number {
  const next = nextReservationAfter(reservations, roomId, date, nowMinutes);
  return next ? timeToMinutes(next.startTime) : BUSINESS_END_MIN;
}

export type Gap = { start: number; end: number };

/** Free gaps within business hours for a room on a given date. */
export function freeGaps(reservations: Reservation[], roomId: string, date: string): Gap[] {
  const sorted = reservationsForRoomOnDate(reservations, roomId, date);
  const gaps: Gap[] = [];
  let cursor = BUSINESS_START_MIN;

  for (const r of sorted) {
    const start = timeToMinutes(r.startTime);
    const end = timeToMinutes(r.endTime);
    if (start > cursor) {
      gaps.push({ start: cursor, end: start });
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < BUSINESS_END_MIN) {
    gaps.push({ start: cursor, end: BUSINESS_END_MIN });
  }
  return gaps.filter((g) => g.end > g.start);
}

export function formatMinutesLabel(minutes: number): string {
  return minutesToTime(minutes);
}

/** Whether `name` is the organizer or a listed member of the reservation. */
export function isMyReservation(reservation: Reservation, name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  return (
    reservation.organizer === trimmed || reservation.members.includes(trimmed)
  );
}
