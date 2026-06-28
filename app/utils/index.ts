import { CalendarDate } from "@internationalized/date";

export const calendarDateToYmd = (date?: CalendarDate): string | undefined => {
  if (!date) return undefined;
  const year = String(date.year).padStart(4, "0");
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const YmdToCalendarDate = (
  dateString?: string,
): CalendarDate | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return new CalendarDate(year, month, day);
};
