export function toUTCDate(dateString: string): Date {
  const date = new Date(dateString)

  if (!dateString.includes("Z") && !dateString.includes("+") && !dateString.includes("-", 10)) {
    return new Date(dateString + "Z")
  }

  return date
}

export function toLocalDate(utcDate: Date): Date {
  return new Date(utcDate.getTime())
}

export function formatDateForDisplay(utcDate: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options
  }

  return utcDate.toLocaleDateString(undefined, defaultOptions)
}

export function formatTimeForDisplay(utcDate: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options
  }

  return utcDate.toLocaleTimeString(undefined, defaultOptions)
}

export function formatDateTimeForDisplay(
  utcDate: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options
  }

  return utcDate.toLocaleString(undefined, defaultOptions)
}

export function createUTCDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
}

export function getCurrentUTCDate(): Date {
  return new Date()
}

export function parseRelativeDate(relativeDate: string, baseDate: Date = new Date()): Date {
  const utcBase = new Date(baseDate.toISOString())
  const lowerDate = relativeDate.toLowerCase().trim()

  if (lowerDate === "today") {
    return utcBase
  }

  if (lowerDate === "tomorrow") {
    return new Date(utcBase.getTime() + 24 * 60 * 60 * 1000)
  }

  if (lowerDate === "yesterday") {
    return new Date(utcBase.getTime() - 24 * 60 * 60 * 1000)
  }

  const inDaysMatch = lowerDate.match(/in (\d+) days?/)
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1])
    return new Date(utcBase.getTime() + days * 24 * 60 * 60 * 1000)
  }

  if (lowerDate === "next week") {
    return new Date(utcBase.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  if (lowerDate === "next month") {
    const nextMonth = new Date(utcBase)
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1)
    return nextMonth
  }

  if (!isNaN(Date.parse(relativeDate))) {
    return toUTCDate(relativeDate)
  }

  return utcBase
}

export function fromDatabaseDate(timestamp: string | Date): Date {
  return new Date(timestamp)
}

export function toDatabaseDate(date: Date): string {
  return date.toISOString()
}

export function formatEventTimeRange(
  startTime: Date,
  endTime?: Date | null,
  isAllDay?: boolean
): string {
  if (isAllDay) {
    return formatDateForDisplay(startTime)
  }

  if (endTime) {
    const startFormatted = formatTimeForDisplay(startTime)
    const endFormatted = formatTimeForDisplay(endTime)
    return `${formatDateForDisplay(startTime)} at ${startFormatted} - ${endFormatted}`
  }

  return `${formatDateForDisplay(startTime)} at ${formatTimeForDisplay(startTime)}`
}
