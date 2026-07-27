import { Reservation } from "./types";
import { rangesOverlap, timeToMinutes } from "./time";

export function isRoomAvailable(
  reservations: Reservation[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeReservationId?: string
): boolean {
  return !reservations.some(
    (r) =>
      r.roomId === roomId &&
      r.date === date &&
      r.id !== excludeReservationId &&
      rangesOverlap(r.startTime, r.endTime, startTime, endTime)
  );
}

export type DraftValidationInput = {
  roomId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  attendees: number;
  roomCapacity: number | null;
  reservations: Reservation[];
};

export function validateDraft(input: DraftValidationInput): string[] {
  const errors: string[] = [];

  if (!input.roomId) {
    errors.push("会議室を選択してください");
  }

  if (timeToMinutes(input.startTime) >= timeToMinutes(input.endTime)) {
    errors.push("開始時間は終了時間より前にしてください");
  }

  if (input.roomCapacity !== null && input.attendees > input.roomCapacity) {
    errors.push(
      `参加人数(${input.attendees}名)が定員(${input.roomCapacity}名)を超えています`
    );
  }

  if (input.attendees < 1) {
    errors.push("参加人数は1名以上を入力してください");
  }

  if (!input.title.trim()) {
    errors.push("会議名を入力してください");
  }

  if (!input.organizer.trim()) {
    errors.push("予約者を入力してください");
  }

  if (
    input.roomId &&
    timeToMinutes(input.startTime) < timeToMinutes(input.endTime) &&
    !isRoomAvailable(
      input.reservations,
      input.roomId,
      input.date,
      input.startTime,
      input.endTime
    )
  ) {
    errors.push("選択した時間帯はすでに予約されています");
  }

  return errors;
}
