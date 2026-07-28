export type RoomArea = "来客スペース" | "執務室内";
export type RoomType = "個室" | "オープン";

export type Room = {
  id: string;
  name: string;
  capacity: number;
  area: RoomArea;
  roomType: RoomType;
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
  /** Names of participants, in addition to the organizer. */
  members: string[];
};

export type ReservationDraft = {
  roomId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  attendees: number;
  members: string[];
};
