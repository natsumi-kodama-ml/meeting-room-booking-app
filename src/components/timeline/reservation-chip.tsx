"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Reservation } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PencilSimple, TrashSimple, UserCircle, UsersThree } from "@phosphor-icons/react";
import { useCurrentUser } from "@/components/current-user-provider";
import { isMyReservation } from "@/lib/availability";
import { cn } from "@/lib/utils";

type ReservationChipProps = {
  reservation: Reservation;
  style: React.CSSProperties;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
};

export function ReservationChip({
  reservation,
  style,
  onEdit,
  onDelete,
}: ReservationChipProps) {
  const { myName } = useCurrentUser();
  const mine = isMyReservation(reservation, myName);
  const [open, setOpen] = useState(false);

  function handleEdit() {
    setOpen(false);
    onEdit(reservation);
  }

  function handleDelete() {
    setOpen(false);
    onDelete(reservation.id);
    toast.success("予約を削除しました", {
      description: `${reservation.title} ${reservation.startTime}-${reservation.endTime}`,
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            style={style}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute top-1.5 bottom-1.5 rounded-md border-l-[3px] px-2 py-1 overflow-hidden text-left transition-colors",
              mine
                ? "border-accent-foreground bg-accent ring-1 ring-accent-foreground/30 hover:bg-accent/80"
                : "border-primary bg-primary/10 hover:bg-primary/15"
            )}
          />
        }
      >
        <div className="flex items-center gap-1">
          {mine && <UserCircle className="size-3 shrink-0 text-accent-foreground" />}
          <p className="truncate text-xs font-medium text-foreground">
            {reservation.title}
          </p>
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {reservation.startTime}-{reservation.endTime}
        </p>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5 p-1">
          <div className="flex items-center gap-1.5">
            <p className="font-medium">{reservation.title}</p>
            {mine && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                参加しています
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {reservation.startTime} - {reservation.endTime}
          </p>
          <p className="text-muted-foreground">予約者: {reservation.organizer}</p>
          {reservation.members.length > 0 && (
            <p className="text-muted-foreground">
              メンバー: {reservation.members.join("、")}
            </p>
          )}
          <p className="flex items-center gap-1 text-muted-foreground">
            <UsersThree className="size-3.5" />
            {reservation.attendees}名
          </p>
          {mine ? (
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={handleEdit}
              >
                <PencilSimple className="size-3.5" />
                編集
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={handleDelete}
              >
                <TrashSimple className="size-3.5" />
                削除
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              予約者・参加メンバーのみ編集・削除できます
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
