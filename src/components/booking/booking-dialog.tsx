"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROOMS, getRoomById } from "@/lib/rooms";
import { Reservation } from "@/lib/types";
import { isRoomAvailable } from "@/lib/validation";
import {
  businessTimeOptions,
  formatDateKey,
  formatDateLabel,
  timeToMinutes,
} from "@/lib/time";
import {
  CalendarBlank,
  Check,
  Clock,
  DoorOpen,
  UsersThree,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STEPS = ["日付", "時間帯", "会議室", "詳細", "確認"] as const;

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seed: {
    roomId: string | null;
    date: string;
    startTime: string;
    endTime: string;
  };
  reservations: Reservation[];
  onConfirm: (input: Omit<Reservation, "id">) => void;
};

export function BookingDialog({
  open,
  onOpenChange,
  seed,
  reservations,
  onConfirm,
}: BookingDialogProps) {
  const [step, setStep] = useState(seed.roomId ? 1 : 0);
  const [date, setDate] = useState(seed.date);
  const [startTime, setStartTime] = useState(seed.startTime);
  const [endTime, setEndTime] = useState(seed.endTime);
  const [roomId, setRoomId] = useState<string | null>(seed.roomId);
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [attendees, setAttendees] = useState(1);

  const timeOptions = businessTimeOptions();
  const endTimeOptions = timeOptions.filter(
    (t) => timeToMinutes(t) > timeToMinutes(startTime)
  );
  const selectedRoom = roomId ? getRoomById(roomId) : undefined;

  const timeValid = timeToMinutes(startTime) < timeToMinutes(endTime);
  const attendeesValid =
    attendees >= 1 && (!selectedRoom || attendees <= selectedRoom.capacity);
  const detailsValid = title.trim().length > 0 && organizer.trim().length > 0;

  const canProceed = [
    Boolean(date),
    timeValid,
    Boolean(roomId),
    attendeesValid && detailsValid,
    true,
  ][step];

  function handleConfirm() {
    if (!roomId) return;
    onConfirm({
      roomId,
      date,
      startTime,
      endTime,
      title: title.trim(),
      organizer: organizer.trim(),
      attendees,
    });
    onOpenChange(false);
    toast.success("予約を確定しました", {
      description: `${selectedRoom?.name} ${startTime}-${endTime}`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>会議室を予約</DialogTitle>
          <DialogDescription>
            ステップ {step + 1} / {STEPS.length}: {STEPS[step]}を選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary/15 text-primary ring-1 ring-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    i < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-72">
          {step === 0 && (
            <div className="flex flex-col items-center gap-2">
              <Calendar
                mode="single"
                selected={new Date(`${date}T00:00:00`)}
                onSelect={(d) => d && setDate(formatDateKey(d))}
                disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarBlank className="size-4" />
                {formatDateLabel(new Date(`${date}T00:00:00`))}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>開始時間</Label>
                  <Select
                    value={startTime}
                    onValueChange={(v) => {
                      if (!v) return;
                      setStartTime(v);
                      if (timeToMinutes(v) >= timeToMinutes(endTime)) {
                        const next = timeOptions.find(
                          (t) => timeToMinutes(t) > timeToMinutes(v)
                        );
                        if (next) setEndTime(next);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions
                        .slice(0, -1)
                        .map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>終了時間</Label>
                  <Select
                    value={endTime}
                    onValueChange={(v) => v && setEndTime(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {endTimeOptions.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!timeValid && (
                <p className="text-sm text-destructive">
                  開始時間は終了時間より前にしてください
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              {ROOMS.map((room) => {
                const available = isRoomAvailable(
                  reservations,
                  room.id,
                  date,
                  startTime,
                  endTime
                );
                const selected = roomId === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    disabled={!available}
                    onClick={() => setRoomId(room.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                      !available && "cursor-not-allowed opacity-50 hover:bg-transparent"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.location} ・ 定員{room.capacity}名
                        {room.equipment.length > 0 &&
                          ` ・ ${room.equipment.join(" / ")}`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-medium",
                        available ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {available ? "空いています" : "予約済み"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">会議名</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 週次定例"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="organizer">予約者</Label>
                <Input
                  id="organizer"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="例: 田中 太郎"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="attendees">参加人数</Label>
                <Input
                  id="attendees"
                  type="number"
                  min={1}
                  max={selectedRoom?.capacity}
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                />
                {selectedRoom && (
                  <p className="text-xs text-muted-foreground">
                    {selectedRoom.name}の定員は{selectedRoom.capacity}名です
                  </p>
                )}
                {!attendeesValid && attendees >= 1 && (
                  <p className="text-sm text-destructive">
                    参加人数が定員を超えています
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && selectedRoom && (
            <div className="flex flex-col gap-3 rounded-lg bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm">
                <DoorOpen className="size-4 text-muted-foreground" />
                <span className="font-medium">{selectedRoom.name}</span>
                <span className="text-muted-foreground">
                  ({selectedRoom.location})
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarBlank className="size-4 text-muted-foreground" />
                {formatDateLabel(new Date(`${date}T00:00:00`))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                {startTime} - {endTime}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UsersThree className="size-4 text-muted-foreground" />
                {attendees}名(予約者: {organizer})
              </div>
              <div className="border-t border-border/70 pt-3 text-sm">
                <span className="text-muted-foreground">会議名: </span>
                {title}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              戻る
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
              次へ
            </Button>
          ) : (
            <Button onClick={handleConfirm}>予約を確定する</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
