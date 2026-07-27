export type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
};

export type Reservation = {
  id: string;
  roomId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm, 24h */
  startTime: string;
  /** HH:mm, 24h */
  endTime: string;
  title: string;
  organizer: string;
  attendees: number;
};

export type ReservationDraft = {
  roomId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  attendees: number;
};
