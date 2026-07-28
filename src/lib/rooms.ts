import { Room } from "./types";

export const ROOMS: Room[] = [
  {
    id: "400",
    name: "400 Meeting Room",
    capacity: 6,
    area: "来客スペース",
    roomType: "個室",
    equipment: ["モニター", "黒板", "Jabra"],
  },
  {
    id: "408",
    name: "401 Meeting Room",
    capacity: 10,
    area: "執務室内",
    roomType: "個室",
    equipment: ["モニター", "ホワイトボード", "Jabra"],
  },
  {
    id: "415",
    name: "402 Skype Room",
    capacity: 2,
    area: "執務室内",
    roomType: "個室",
    equipment: ["モニター"],
  },
  {
    id: "414",
    name: "403 Box Seat",
    capacity: 6,
    area: "執務室内",
    roomType: "オープン",
    equipment: [],
  },
  {
    id: "423",
    name: "404 Meeting Room",
    capacity: 12,
    area: "来客スペース",
    roomType: "個室",
    equipment: ["プロジェクタ", "ホワイトボード", "Jabra"],
  },
];

export function getRoomById(roomId: string): Room | undefined {
  return ROOMS.find((room) => room.id === roomId);
}

export function roomLocationLabel(room: Room): string {
  return `${room.area}・${room.roomType}`;
}
