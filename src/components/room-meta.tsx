import { MapPin, UsersThree } from "@phosphor-icons/react";
import { Room } from "@/lib/types";
import { roomLocationLabel } from "@/lib/rooms";
import { cn } from "@/lib/utils";

/** Location + capacity line shown wherever a room is listed. */
export function RoomMeta({
  room,
  className,
  iconClassName = "size-3.5",
}: {
  room: Room;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <p className={cn("flex items-center gap-1 text-muted-foreground", className)}>
      <MapPin className={cn("shrink-0", iconClassName)} />
      {roomLocationLabel(room)}
      <span className="mx-0.5">・</span>
      <UsersThree className={cn("shrink-0", iconClassName)} />
      定員{room.capacity}名
    </p>
  );
}
