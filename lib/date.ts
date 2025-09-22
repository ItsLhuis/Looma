export function toUTCDate(dateString: string): Date {
  const date = new Date(dateString)

  if (!dateString.includes("Z") && !dateString.includes("+") && !dateString.includes("-", 10)) {
    return new Date(dateString + "Z")
  }

  return date
}

export function toLocalDate(utcDate: Date, timezone?: string): Date {
  if (timezone) {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })

    const parts = formatter.formatToParts(utcDate)
    const year = parts.find((p) => p.type === "year")?.value
    const month = parts.find((p) => p.type === "month")?.value
    const day = parts.find((p) => p.type === "day")?.value
    const hour = parts.find((p) => p.type === "hour")?.value
    const minute = parts.find((p) => p.type === "minute")?.value
    const second = parts.find((p) => p.type === "second")?.value

    if (year && month && day && hour && minute && second) {
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
    }
  }

  return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
}

export function formatDateForDisplay(utcDate: Date, timezone?: string): string {
  if (timezone) {
    return utcDate.toLocaleString(undefined, { timeZone: timezone })
  }

  return utcDate.toLocaleString()
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
  return new Date(new Date().toISOString())
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
