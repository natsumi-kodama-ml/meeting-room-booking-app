"use client";

import { CaretLeft, MapPin, Plus, TrashSimple, UsersThree } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Room, Reservation } from "@/lib/types";
import {
  reservationsForRoomOnDate,
  currentReservation,
  isMyReservation,
} from "@/lib/availability";
import { RoomStatusBadge } from "@/components/mobile/room-status-badge";
import { isRoomAvailableNow } from "@/lib/availability";
import { formatDateLabel } from "@/lib/time";
import { useCurrentUser } from "@/components/current-user-provider";
import { cn } from "@/lib/utils";

type RoomDetailProps = {
  room: Room;
  reservations: Reservation[];
  date: string;
  dateObj: Date;
  nowMinutes: number;
  onBack: () => void;
  onBook: () => void;
  onDeleteReservation: (id: string) => void;
};

export function RoomDetail({
  room,
  reservations,
  date,
  dateObj,
  nowMinutes,
  onBack,
  onBook,
  onDeleteReservation,
}: RoomDetailProps) {
  const { myName } = useCurrentUser();

  function handleDelete(r: Reservation) {
    onDeleteReservation(r.id);
    toast.success("予約を削除しました", {
      description: `${r.title} ${r.startTime}-${r.endTime}`,
    });
  }
  const todays = reservationsForRoomOnDate(reservations, room.id, date);
  const available = isRoomAvailableNow(reservations, room.id, date, nowMinutes);
  const ongoing = currentReservation(reservations, room.id, date, nowMinutes);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <CaretLeft className="size-4" />
        戻る
      </button>

      <div className="flex flex-col gap-2 rounded-xl bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-lg font-semibold leading-tight">{room.name}</h1>
          <RoomStatusBadge available={available} />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {room.location}
          <span className="mx-0.5">・</span>
          <UsersThree className="size-4 shrink-0" />
          定員{room.capacity}名
        </p>
        {room.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.equipment.map((eq) => (
              <Badge key={eq} variant="secondary" className="font-normal">
                {eq}
              </Badge>
            ))}
          </div>
        )}
        {ongoing && (
          <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            現在使用中: {ongoing.title}({ongoing.startTime}-{ongoing.endTime})
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {formatDateLabel(dateObj)}の予定
        </h2>
        {todays.length === 0 ? (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground shadow-sm">
            本日の予定はありません
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border/70 rounded-xl bg-card px-4 shadow-sm">
            {todays.map((r) => {
              const mine = isMyReservation(r, myName);
              return (
              <div
                key={r.id}
                className={cn(
                  "flex items-center justify-between gap-3 py-3",
                  mine && "-mx-4 border-l-[3px] border-accent-foreground bg-accent/60 px-4"
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    {mine && (
                      <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                        参加
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    予約者: {r.organizer} ・ {r.attendees}名
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {r.startTime}-{r.endTime}
                  </p>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="この予約を削除"
                        />
                      }
                    >
                      <TrashSimple className="size-4 text-muted-foreground" />
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-56"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col gap-2 p-1">
                        <p className="text-sm">
                          「{r.title}」を削除しますか？
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleDelete(r)}
                        >
                          <TrashSimple className="size-3.5" />
                          削除する
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <Button onClick={onBook} className="mt-1 gap-1.5">
        <Plus className="size-4" />
        この会議室を予約する
      </Button>
    </div>
  );
}
