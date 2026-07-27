import { cn } from "@/lib/utils";

type RoomStatusBadgeProps = {
  available: boolean;
  className?: string;
};

export function RoomStatusBadge({ available, className }: RoomStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        available
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          available ? "bg-primary" : "bg-muted-foreground/50"
        )}
      />
      {available ? "空いています" : "使用中"}
    </span>
  );
}
