import { Room } from "./types";

export const ROOMS: Room[] = [
  {
    id: "400",
    name: "400 Meeting Room",
    capacity: 6,
    location: "来客スペース・個室",
    equipment: ["モニター", "黒板", "Jabra"],
  },
  {
    id: "408",
    name: "408 Meeting Room",
    capacity: 10,
    location: "執務室内・個室",
    equipment: ["モニター", "ホワイトボード", "Jabra"],
  },
  {
    id: "415",
    name: "415 Skype Room",
    capacity: 2,
    location: "執務室内・個室",
    equipment: ["モニター"],
  },
  {
    id: "414",
    name: "414 Box Seat",
    capacity: 6,
    location: "執務室内・オープン",
    equipment: [],
  },
  {
    id: "423",
    name: "423 Meeting Room",
    capacity: 12,
    location: "来客スペース・個室",
    equipment: ["プロジェクタ", "ホワイトボード", "Jabra"],
  },
];

export function getRoomById(roomId: string): Room | undefined {
  return ROOMS.find((room) => room.id === roomId);
}
