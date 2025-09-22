"use client"

import * as React from "react"

import {
  add,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parse,
  startOfDay,
  startOfToday,
  startOfWeek
} from "date-fns"

import { cn } from "@/lib/utils"

import { formatDateForDisplay, formatTimeForDisplay } from "@/lib/date"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button, type ButtonProps } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/Calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/Form"
import { Icon } from "@/components/ui/Icon"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { Switch } from "@/components/ui/Switch"
import { Textarea } from "@/components/ui/Textarea"
import { TimePicker } from "@/components/ui/TimePicker"
import { Typography } from "@/components/ui/Typography"

type CalendarEvent = {
  id: string
  title: string
  description?: string | null
  startTime: Date
  endTime?: Date | null
  isAllDay?: boolean
}

type CreateEventPayload = {
  title: string
  description?: string | null
  startTime: Date
  endTime?: Date | null
  isAllDay: boolean
}

type UpdateEventPayload = CreateEventPayload & {
  startTime?: Date | null
  endTime?: Date | null
}

type FullScreenCalendarProps = {
  events: CalendarEvent[]
  onCreateEvent?: (payload: CreateEventPayload) => Promise<void> | void
  onUpdateEvent?: (id: string, payload: UpdateEventPayload) => Promise<void> | void
  onDeleteEvent?: (id: string) => Promise<void> | void
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  showCreateButton?: boolean
  shouldOpenCreateDialog?: boolean
  onCreateDialogClose?: () => void
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7"
]

const formatDate = (date: Date): string => formatDateForDisplay(date)

const combineDateTime = (dateStr: string, timeStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map((n) => Number.parseInt(n))
  const [hh, mm] = timeStr.split(":").map((n) => Number.parseInt(n))

  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
}

const getEventsForDay = (events: CalendarEvent[], day: Date) => {
  return events.filter((event) => {
    const dayStart = startOfDay(day)
    const eventStart = startOfDay(event.startTime)
    const eventEnd = event.endTime ? startOfDay(event.endTime) : eventStart

    if (!event.endTime || isSameDay(event.startTime, event.endTime)) {
      return isSameDay(eventStart, dayStart)
    }

    const daysDiff = differenceInDays(eventEnd, eventStart)

    if (daysDiff <= 2) {
      return isWithinInterval(dayStart, { start: eventStart, end: eventEnd })
    }

    return isSameDay(eventStart, dayStart) || isSameDay(eventEnd, dayStart)
  })
}

const getEventDisplayInfo = (event: CalendarEvent, day: Date) => {
  const isStartDay = isSameDay(event.startTime, day)
  const isEndDay = event.endTime ? isSameDay(event.endTime, day) : isStartDay

  let displayTitle = event.title
  let displayTime = event.isAllDay ? "All day" : formatTimeForDisplay(event.startTime)

  if (isEndDay && !isStartDay) {
    displayTitle = `${event.title} (End)`
    displayTime = event.isAllDay ? "All day" : formatTimeForDisplay(event.endTime!)
  } else if (isStartDay && isEndDay && event.endTime && !event.isAllDay) {
    displayTime = `${formatTimeForDisplay(event.startTime)} - ${formatTimeForDisplay(event.endTime)}`
  }

  return {
    isStartDay,
    isEndDay,
    displayTitle,
    displayTime
  }
}

const formSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z.string().nullable().optional(),
    isAllDay: z.boolean(),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string(),
    endDate: z.string().optional(),
    endTime: z.string()
  })
  .refine(
    (data) => {
      if (!data.endDate) return true

      const startDateTime = combineDateTime(data.startDate, data.startTime || "00:00")
      const endDateTime = combineDateTime(data.endDate, data.endTime || "00:00")

      return endDateTime >= startDateTime
    },
    {
      message: "End date and time must be after start date and time",
      path: ["endDate"]
    }
  )

type EventFormValues = z.infer<typeof formSchema>

type EventDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  event?: CalendarEvent | null
  initialDate?: Date
  onSubmit: (values: EventFormValues) => Promise<void>
  onDelete?: () => Promise<void>
  isLoading?: boolean
}

function EventDialog({
  open,
  onOpenChange,
  mode,
  event,
  initialDate,
  onSubmit,
  onDelete,
  isLoading = false
}: EventDialogProps) {
  const today = startOfToday()
  const defaultDate = initialDate || today

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      isAllDay: false,
      startDate: format(defaultDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endDate: format(defaultDate, "yyyy-MM-dd"),
      endTime: "10:00"
    }
  })

  const isAllDay = form.watch("isAllDay")
  const [initialValues, setInitialValues] = React.useState<EventFormValues | null>(null)

  const currentValues = form.watch()

  const isFormModified = React.useMemo(() => {
    if (mode !== "edit" || !initialValues) return false

    return (
      currentValues.title !== initialValues.title ||
      currentValues.description !== initialValues.description ||
      currentValues.isAllDay !== initialValues.isAllDay ||
      currentValues.startDate !== initialValues.startDate ||
      currentValues.startTime !== initialValues.startTime ||
      currentValues.endDate !== initialValues.endDate ||
      currentValues.endTime !== initialValues.endTime
    )
  }, [mode, initialValues, currentValues])

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && event) {
        const sd = format(event.startTime, "yyyy-MM-dd")
        const st = formatTimeForDisplay(event.startTime, {
          hour12: false
        })
        const ed = event.endTime ? format(event.endTime, "yyyy-MM-dd") : sd
        const et = event.endTime
          ? formatTimeForDisplay(event.endTime, {
              hour12: false
            })
          : st

        const editValues = {
          title: event.title,
          description: event.description || "",
          isAllDay: Boolean(event.isAllDay),
          startDate: sd,
          startTime: st,
          endDate: ed,
          endTime: et
        }

        form.reset(editValues)
        setInitialValues(editValues)
      } else {
        const dateStr = format(defaultDate, "yyyy-MM-dd")
        const createValues = {
          title: "",
          description: "",
          isAllDay: false,
          startDate: dateStr,
          startTime: "09:00",
          endDate: dateStr,
          endTime: "10:00"
        }

        form.reset(createValues)
        setInitialValues(null)
      }
    }
  }, [open, mode, event, defaultDate, form])

  const handleSubmit = async (values: EventFormValues) => {
    try {
      await onSubmit(values)
    } catch (error) {
      console.error("Failed to submit event:", error)
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete()
      } catch (error) {
        console.error("Failed to delete event:", error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Event" : "Edit Event"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new calendar event" : "Update or delete this event"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isLoading}
                      className="max-h-24 min-h-16"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>All day</FormLabel>
                  <FormControl>
                    <Label className="dark:bg-input/30 border-input flex items-center rounded-md border p-2">
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                      <Typography affects={["muted", "small"]}>Mark as all day</Typography>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div
              className={cn("grid gap-6", isAllDay ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}
            >
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "hover:text-foreground w-full pl-3",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              formatDate(new Date(field.value))
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Icon name="Calendar" className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) =>
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                            }
                            disabled={(date) => date < new Date("1900-01-01")}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isAllDay && (
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start time</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!isAllDay && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "hover:text-foreground w-full pl-3",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isLoading}
                            >
                              {field.value ? (
                                formatDate(new Date(field.value))
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Icon name="Calendar" className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                              }
                              disabled={(date) => date < new Date("1900-01-01")}
                              autoFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!isAllDay && (
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End time</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DialogFooter className="gap-2">
              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Delete
                </Button>
              )}
              <div className="grow" />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || isLoading || (mode === "edit" && !isFormModified)
                }
                isLoading={isLoading}
              >
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type EventButtonProps = {
  event: CalendarEvent
  day: Date
  onClick: (e: React.MouseEvent) => void
  buttonVariant?: ButtonProps["variant"]
  variant?: "full" | "compact"
}

function EventButton({
  event,
  day,
  onClick,
  buttonVariant = "ghost",
  variant = "full"
}: EventButtonProps) {
  const displayInfo = getEventDisplayInfo(event, day)

  return (
    <Button
      variant={buttonVariant}
      className={cn(
        "hover:bg-accent/60 text-left transition-colors",
        variant === "full"
          ? "flex h-auto w-full flex-col items-start gap-1 rounded-lg border p-2 text-xs leading-tight"
          : "flex h-auto w-full items-center justify-between gap-2 rounded-md p-3"
      )}
      onClick={onClick}
    >
      <div className="mx-1 flex min-w-0 flex-1 flex-col gap-1 truncate">
        <Typography affects={["bold", "small"]} className={variant === "full" ? "truncate" : ""}>
          {displayInfo.displayTitle}
        </Typography>
        <Typography affects={["small", "muted"]} className={variant === "compact" ? "block" : ""}>
          {displayInfo.displayTime}
        </Typography>
      </div>
      {variant === "compact" && <Icon name="Pencil" className="shrink-0 opacity-60" />}
    </Button>
  )
}

function FullScreenCalendar({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  selectedDate,
  onDateSelect,
  showCreateButton = true,
  shouldOpenCreateDialog = false,
  onCreateDialogClose
}: FullScreenCalendarProps) {
  const today = startOfToday()

  const [selectedDay, setSelectedDay] = React.useState(selectedDate || today)
  const [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"))

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")

  const [activeEvent, setActiveEvent] = React.useState<CalendarEvent | null>(null)

  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (selectedDate) {
      setSelectedDay(selectedDate)
    }
  }, [selectedDate])

  const handleDaySelect = React.useCallback(
    (day: Date) => {
      setSelectedDay(day)
      onDateSelect?.(day)
    },
    [onDateSelect]
  )

  const openCreateDialog = React.useCallback((day: Date) => {
    setActiveEvent(null)
    setSelectedDay(day)
    setDialogMode("create")
    setDialogOpen(true)
  }, [])

  React.useEffect(() => {
    if (shouldOpenCreateDialog) {
      openCreateDialog(selectedDay)
      onCreateDialogClose?.()
    }
  }, [shouldOpenCreateDialog, selectedDay, onCreateDialogClose, openCreateDialog])

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

  const days = React.useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth))
      }),
    [firstDayCurrentMonth]
  )

  const getEventsForDayMemo = React.useCallback(
    (day: Date) => getEventsForDay(events, day),
    [events]
  )

  const previousMonth = React.useCallback(() => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }, [firstDayCurrentMonth])

  const nextMonth = React.useCallback(() => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }, [firstDayCurrentMonth])

  const goToToday = React.useCallback(() => {
    setCurrentMonth(format(today, "MMM-yyyy"))
  }, [today])

  const openEditDialog = React.useCallback((event: CalendarEvent) => {
    setActiveEvent(event)
    setDialogMode("edit")
    setDialogOpen(true)
  }, [])

  const handleDialogSubmit = async (values: EventFormValues) => {
    setIsLoading(true)
    try {
      const start = combineDateTime(values.startDate, values.startTime || "00:00")
      const end = values.isAllDay
        ? null
        : combineDateTime(values.endDate || values.startDate, values.endTime || "00:00")

      const payload = {
        title: values.title.trim(),
        description: (values.description || "").trim() || null,
        startTime: start,
        endTime: end,
        isAllDay: values.isAllDay
      }

      if (dialogMode === "create") {
        await onCreateEvent?.(payload)
      } else if (dialogMode === "edit" && activeEvent) {
        await onUpdateEvent?.(activeEvent.id, payload)
      }

      setDialogOpen(false)
      setActiveEvent(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!activeEvent) return

    setIsLoading(true)
    try {
      await onDeleteEvent?.(activeEvent.id)
      setDialogOpen(false)
      setActiveEvent(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
      <div className="flex flex-col space-y-4 border-b p-6 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="bg-muted hidden w-20 flex-col items-center justify-center rounded-md border p-0.5 md:flex">
              <Typography affects={["small", "muted", "bold"]} className="p-1 uppercase">
                {format(today, "MMM")}
              </Typography>
              <div className="bg-background flex w-full items-center justify-center rounded-lg border p-0.5">
                <Typography affects={["large", "bold"]}>{format(today, "d")}</Typography>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Typography variant="h4" className="text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </Typography>
              <Typography affects={["small", "muted"]}>
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex w-full items-center -space-x-px rounded-lg rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none bg-transparent first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <Icon name="ChevronLeft" />
            </Button>
            <Button
              onClick={goToToday}
              className="flex-1 rounded-none bg-transparent first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              <Typography>Today</Typography>
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none bg-transparent first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <Icon name="ChevronRightIcon" />
            </Button>
          </div>
          {showCreateButton && (
            <Button
              className="w-full gap-2 md:w-auto"
              onClick={() => openCreateDialog(selectedDay)}
            >
              <Icon name="Plus" />
              <Typography>New Event</Typography>
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-hidden lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 border-b text-center text-xs leading-6 font-semibold lg:flex-none">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <div key={i} className={cn("border-r py-2.5 last:border-r-0")}>
              <Typography affects={["small", "bold", "muted"]}>{d}</Typography>
            </div>
          ))}
        </div>
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => handleDaySelect(day)}
                onDoubleClick={() => openCreateDialog(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "bg-accent/50 text-muted-foreground",
                  "hover:bg-muted relative flex cursor-pointer flex-col rounded-none border-r border-b transition-colors last:border-r-0 focus:z-10 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0",
                  !isEqual(day, selectedDay) && "hover:bg-accent/75"
                )}
              >
                <header className="flex items-center justify-between p-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      isEqual(day, selectedDay) && "text-primary-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-muted-foreground",
                      isEqual(day, selectedDay) && isToday(day) && "bg-primary border-none",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary text-primary-foreground",
                      (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                      isToday(day) && "border-primary border-2"
                    )}
                  >
                    <Typography affects={["small", "bold"]}>{format(day, "d")}</Typography>
                  </Button>
                </header>
                <div className="flex-1 p-2.5">
                  <div className="space-y-1.5">
                    {getEventsForDayMemo(day)
                      .slice(0, 1)
                      .map((event) => (
                        <EventButton
                          key={event.id}
                          event={event}
                          day={day}
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(event)
                          }}
                          variant="full"
                        />
                      ))}
                    {getEventsForDayMemo(day).length > 1 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-muted-foreground hover:bg-accent/50 h-6 px-1 text-xs"
                          >
                            <Typography affects={["small", "muted"]}>
                              + {getEventsForDayMemo(day).length - 1} more
                            </Typography>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 p-0">
                          <Card className="border-none">
                            <CardHeader className="flex items-center justify-between">
                              <CardTitle>
                                <Typography variant="h4">
                                  Events for {format(day, "MMM d")}
                                </Typography>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {getEventsForDayMemo(day)
                                  .slice(1)
                                  .map((event) => (
                                    <EventButton
                                      key={event.id}
                                      event={event}
                                      day={day}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openEditDialog(event)
                                      }}
                                      variant="compact"
                                      buttonVariant="outline"
                                    />
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-5 lg:hidden">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => handleDaySelect(day)}
                onDoubleClick={() => openCreateDialog(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "bg-accent/50 text-muted-foreground",
                  "hover:bg-muted relative flex cursor-pointer flex-col rounded-none border-r border-b transition-colors last:border-r-0 focus:z-10 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0",
                  !isEqual(day, selectedDay) && "hover:bg-accent/75"
                )}
              >
                <header className="flex items-center justify-between p-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      isEqual(day, selectedDay) && "text-primary-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-muted-foreground",
                      isEqual(day, selectedDay) && isToday(day) && "bg-primary border-none",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary text-primary-foreground",
                      (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                      isToday(day) && "border-primary border-2"
                    )}
                  >
                    <Typography affects={["small", "bold"]}>{format(day, "d")}</Typography>
                  </Button>
                </header>
                <div className="flex-1 p-2.5">
                  {getEventsForDayMemo(day).length > 0 && (
                    <div className="mt-auto flex justify-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-muted-foreground hover:bg-accent/50 h-6 px-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Typography affects={["small", "muted"]}>
                              {getEventsForDayMemo(day).length} event
                              {getEventsForDayMemo(day).length !== 1 ? "s" : ""}
                            </Typography>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 p-0">
                          <div className="p-3">
                            <Typography variant="h6" affects={["bold"]} className="mb-3">
                              Events for {format(day, "MMM d")}
                            </Typography>
                            <div className="space-y-2">
                              {getEventsForDayMemo(day).map((event) => (
                                <EventButton
                                  key={event.id}
                                  event={event}
                                  day={day}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditDialog(event)
                                  }}
                                  variant="compact"
                                />
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        event={activeEvent}
        initialDate={selectedDay}
        onSubmit={handleDialogSubmit}
        onDelete={dialogMode === "edit" ? handleDelete : undefined}
        isLoading={isLoading}
      />
    </div>
  )
}

export { FullScreenCalendar }
