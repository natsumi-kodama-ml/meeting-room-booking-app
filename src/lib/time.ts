export const BUSINESS_START_HOUR = 0;
export const BUSINESS_END_HOUR = 24;
export const SLOT_MINUTES = 30;

/** "HH:mm" -> minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "HH:mm" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDate(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${
    WEEKDAY_JA[date.getDay()]
  })`;
}

/**
 * Minutes-of-day to treat as "now" for a given date: the real current time
 * when viewing today, or business start when browsing another day (so
 * future/past dates read as "the whole day is still ahead").
 */
export function effectiveNowMinutes(date: Date): number {
  const now = new Date();
  if (!isSameDate(date, now)) return BUSINESS_START_HOUR * 60;
  return now.getHours() * 60 + now.getMinutes();
}

export function businessTimeOptions(): string[] {
  const options: string[] = [];
  for (
    let m = BUSINESS_START_HOUR * 60;
    m <= BUSINESS_END_HOUR * 60;
    m += SLOT_MINUTES
  ) {
    options.push(minutesToTime(m));
  }
  return options;
}

export function businessHourMarks(): number[] {
  const marks: number[] = [];
  for (let h = BUSINESS_START_HOUR; h <= BUSINESS_END_HOUR; h++) {
    marks.push(h);
  }
  return marks;
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return (
    timeToMinutes(aStart) < timeToMinutes(bEnd) &&
    timeToMinutes(bStart) < timeToMinutes(aEnd)
  );
}
