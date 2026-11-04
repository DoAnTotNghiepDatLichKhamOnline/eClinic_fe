export type DateDisplayLanguage = "vi" | "en";

function parseLocalDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getLocale(language: DateDisplayLanguage): string {
  return language === "vi" ? "vi-VN" : "en-US";
}

export function formatFullDate(
  value: string | Date | null | undefined,
  language: DateDisplayLanguage = "vi",
): string {
  const date = parseLocalDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(getLocale(language), {
    day: language === "vi" ? "2-digit" : "numeric",
    month: language === "vi" ? "2-digit" : "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  language: DateDisplayLanguage = "vi",
): string {
  const date = parseLocalDate(value);
  if (!date) return "—";

  const time = new Intl.DateTimeFormat(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return `${formatFullDate(date, language)} ${time}`;
}

export function formatDateTimeWithWeekday(
  value: string | Date | null | undefined,
  language: DateDisplayLanguage = "vi",
): string {
  const date = parseLocalDate(value);
  if (!date) return "—";

  const time = new Intl.DateTimeFormat(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${time} - ${formatFullDateWithWeekday(date, language)}`;
}

export function formatFullDateWithWeekday(
  value: string | Date | null | undefined,
  language: DateDisplayLanguage = "vi",
): string {
  const date = parseLocalDate(value);
  if (!date) return "—";

  const weekday = new Intl.DateTimeFormat(getLocale(language), {
    weekday: "long",
  }).format(date);

  return `${weekday}, ${formatFullDate(date, language)}`;
}

export function formatTimeAndDate(
  value: string | Date | null | undefined,
  language: DateDisplayLanguage = "vi",
): string {
  const date = parseLocalDate(value);
  if (!date) return "—";

  const time = new Intl.DateTimeFormat(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return language === "vi"
    ? `${time} ngày ${formatFullDate(date, language)}`
    : `${time} on ${formatFullDate(date, language)}`;
}
