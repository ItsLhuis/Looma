"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/useMediaQuery"

import { cn } from "@/lib/utils"

import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek
} from "date-fns"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/Calendar"
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

type UpdateEventPayload = Partial<CreateEventPayload> & {
  startTime?: Date | null
  endTime?: Date | null
}

type FullScreenCalendarProps = {
  events: CalendarEvent[]
  onCreateEvent?: (payload: CreateEventPayload) => Promise<void> | void
  onUpdateEvent?: (id: string, payload: UpdateEventPayload) => Promise<void> | void
  onDeleteEvent?: (id: string) => Promise<void> | void
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

function FullScreenCalendar({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent
}: FullScreenCalendarProps) {
  const today = startOfToday()

  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"))

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [activeEvent, setActiveEvent] = React.useState<CalendarEvent | null>(null)

  const formSchema = z.object({
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

  type EventFormValues = z.infer<typeof formSchema>

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      isAllDay: false,
      startDate: format(today, "yyyy-MM-dd"),
      startTime: "09:00",
      endDate: format(today, "yyyy-MM-dd"),
      endTime: "10:00"
    }
  })

  function formatDate(date: Date) {
    return date.toLocaleDateString()
  }

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth))
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
  }

  const resetFormForDay = React.useCallback(
    (day: Date) => {
      const dateStr = format(day, "yyyy-MM-dd")
      form.reset({
        title: "",
        description: "",
        isAllDay: false,
        startDate: dateStr,
        startTime: "09:00",
        endDate: dateStr,
        endTime: "10:00"
      })
    },
    [form]
  )

  const openCreateForDay = React.useCallback(
    (day: Date) => {
      resetFormForDay(day)
      setActiveEvent(null)
      setCreateOpen(true)
    },
    [resetFormForDay]
  )

  const openEditForEvent = React.useCallback(
    (event: CalendarEvent) => {
      setActiveEvent(event)
      const sd = format(event.startTime, "yyyy-MM-dd")
      const st = format(event.startTime, "HH:mm")
      const ed = event.endTime ? format(event.endTime, "yyyy-MM-dd") : sd
      const et = event.endTime ? format(event.endTime, "HH:mm") : st
      form.reset({
        title: event.title,
        description: event.description || "",
        isAllDay: Boolean(event.isAllDay),
        startDate: sd,
        startTime: st,
        endDate: ed,
        endTime: et
      })
      setEditOpen(true)
    },
    [form]
  )

  const getEventsForDay = React.useCallback(
    (day: Date) => {
      return events.filter((ev) => isSameDay(ev.startTime, day))
    },
    [events]
  )

  function combineDateTime(dateStr: string, timeStr: string): Date {
    const [y, m, d] = dateStr.split("-").map((n) => Number.parseInt(n))
    const [hh, mm] = timeStr.split(":").map((n) => Number.parseInt(n))
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
  }

  const handleCreateSubmit = async (values: EventFormValues) => {
    const start = combineDateTime(values.startDate, values.startTime || "00:00")
    const end = values.isAllDay
      ? null
      : combineDateTime(values.endDate || values.startDate, values.endTime || "00:00")
    await onCreateEvent?.({
      title: values.title.trim(),
      description: (values.description || "").trim() || null,
      startTime: start,
      endTime: end,
      isAllDay: values.isAllDay
    })
    setCreateOpen(false)
  }

  const handleUpdateSubmit = async (values: EventFormValues) => {
    if (!activeEvent) return
    const start = combineDateTime(values.startDate, values.startTime || "00:00")
    const end = values.isAllDay
      ? null
      : combineDateTime(values.endDate || values.startDate, values.endTime || "00:00")
    await onUpdateEvent?.(activeEvent.id, {
      title: values.title.trim(),
      description: (values.description || "").trim() || null,
      startTime: start,
      endTime: end,
      isAllDay: values.isAllDay
    })
    setEditOpen(false)
    setActiveEvent(null)
  }

  const handleDelete = async () => {
    if (!activeEvent) return
    await onDeleteEvent?.(activeEvent.id)
    setEditOpen(false)
    setActiveEvent(null)
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
            <div className="flex flex-col">
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
          <div className="hidden w-full items-center -space-x-px rounded-lg md:flex rtl:space-x-reverse">
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
              className="w-full rounded-none bg-transparent first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
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
          <Button className="w-full gap-2 md:w-auto" onClick={() => openCreateForDay(selectedDay)}>
            <Icon name="PlusCircle" />
            <Typography>New Event</Typography>
          </Button>
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
            {days.map((day, dayIdx) =>
              !isDesktop ? (
                <Button
                  onClick={() => setSelectedDay(day)}
                  onDoubleClick={() => openCreateForDay(day)}
                  key={dayIdx}
                  variant="ghost"
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
                    (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                    "hover:bg-muted flex h-14 flex-col rounded-none border-r border-b px-3 py-2 last:border-r-0 focus:z-10 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0"
                  )}
                >
                  <div
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isToday(day) && "border-primary border-2",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-primary text-primary-foreground",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    <Typography affects={["small", "bold"]}>{format(day, "d")}</Typography>
                  </div>
                  {getEventsForDay(day).length > 0 && (
                    <div className="mt-auto flex justify-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-muted-foreground hover:bg-accent/50 h-6 px-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Typography affects={["small", "muted"]}>
                              {getEventsForDay(day).length} event
                              {getEventsForDay(day).length !== 1 ? "s" : ""}
                            </Typography>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 p-0">
                          <div className="p-3">
                            <Typography variant="h6" affects={["bold"]} className="mb-3">
                              Events for {format(day, "MMM d")}
                            </Typography>
                            <div className="space-y-2">
                              {getEventsForDay(day).map((event) => (
                                <Button
                                  key={event.id}
                                  variant="ghost"
                                  className="hover:bg-accent/60 flex h-auto w-full items-center justify-between gap-2 rounded-md p-3 text-left transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditForEvent(event)
                                  }}
                                >
                                  <div className="min-w-0 flex-1">
                                    <Typography affects={["bold", "small"]}>
                                      {event.title}
                                    </Typography>
                                    <Typography affects={["small", "muted"]} className="block">
                                      {event.isAllDay
                                        ? "All day"
                                        : `${format(event.startTime, "HH:mm")}${event.endTime ? ` - ${format(event.endTime, "HH:mm")}` : ""}`}
                                    </Typography>
                                  </div>
                                  <Icon name="Pencil" className="shrink-0 opacity-60" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </Button>
              ) : (
                <div
                  key={dayIdx}
                  onClick={() => setSelectedDay(day)}
                  onDoubleClick={() => openCreateForDay(day)}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-accent/50 text-muted-foreground",
                    "hover:bg-muted relative flex flex-col rounded-none border-r border-b last:border-r-0 focus:z-10 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0",
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
                      {getEventsForDay(day)
                        .slice(0, 1)
                        .map((event) => (
                          <Button
                            key={event.id}
                            variant="ghost"
                            className="hover:bg-accent/60 flex h-auto w-full flex-col items-start gap-1 rounded-lg border p-2 text-left text-xs leading-tight transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditForEvent(event)
                            }}
                          >
                            <Typography affects={["bold", "small"]} className="truncate">
                              {event.title}
                            </Typography>
                            <Typography affects={["small", "muted"]}>
                              {event.isAllDay
                                ? "All day"
                                : `${format(event.startTime, "HH:mm")}${event.endTime ? ` - ${format(event.endTime, "HH:mm")}` : ""}`}
                            </Typography>
                          </Button>
                        ))}
                      {getEventsForDay(day).length > 1 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-muted-foreground hover:bg-accent/50 h-6 px-1 text-xs"
                            >
                              <Typography affects={["small", "muted"]}>
                                + {getEventsForDay(day).length - 1} more
                              </Typography>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-80 p-0">
                            <div className="p-3">
                              <Typography variant="h6" affects={["bold"]} className="mb-3">
                                Events for {format(day, "MMM d")}
                              </Typography>
                              <div className="space-y-2">
                                {getEventsForDay(day)
                                  .slice(1)
                                  .map((event) => (
                                    <Button
                                      key={event.id}
                                      variant="ghost"
                                      className="hover:bg-accent/60 flex h-auto w-full items-center justify-between gap-2 rounded-md p-3 text-left transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openEditForEvent(event)
                                      }}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <Typography affects={["bold", "small"]}>
                                          {event.title}
                                        </Typography>
                                        <Typography affects={["small", "muted"]} className="block">
                                          {event.isAllDay
                                            ? "All day"
                                            : `${format(event.startTime, "HH:mm")}${event.endTime ? ` - ${format(event.endTime, "HH:mm")}` : ""}`}
                                        </Typography>
                                      </div>
                                      <Icon name="Pencil" className="shrink-0 opacity-60" />
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-5 lg:hidden">
            {days.map((day, dayIdx) => (
              <Button
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => openCreateForDay(day)}
                key={dayIdx}
                variant="ghost"
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
                  (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                  "hover:bg-muted flex h-14 flex-col rounded-none border-r border-b px-3 py-2 last:border-r-0 focus:z-10 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0"
                )}
              >
                <div
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isToday(day) && "border-primary border-2",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-primary text-primary-foreground"
                  )}
                >
                  <Typography affects={["small", "bold"]}>{format(day, "d")}</Typography>
                </div>
                {getEventsForDay(day).length > 0 && (
                  <div className="mt-auto flex justify-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-muted-foreground hover:bg-accent/50 h-6 px-2 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Typography affects={["small", "muted"]}>
                            {getEventsForDay(day).length} event
                            {getEventsForDay(day).length !== 1 ? "s" : ""}
                          </Typography>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80 p-0">
                        <div className="p-3">
                          <Typography variant="h6" affects={["bold"]} className="mb-3">
                            Events for {format(day, "MMM d")}
                          </Typography>
                          <div className="space-y-2">
                            {getEventsForDay(day).map((event) => (
                              <Button
                                key={event.id}
                                variant="ghost"
                                className="hover:bg-accent/60 flex h-auto w-full items-center justify-between gap-2 rounded-md p-3 text-left transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditForEvent(event)
                                }}
                              >
                                <div className="min-w-0 flex-1">
                                  <Typography affects={["bold", "small"]}>{event.title}</Typography>
                                  <Typography affects={["small", "muted"]} className="block">
                                    {event.isAllDay
                                      ? "All day"
                                      : `${format(event.startTime, "HH:mm")}${event.endTime ? ` - ${format(event.endTime, "HH:mm")}` : ""}`}
                                  </Typography>
                                </div>
                                <Icon name="Pencil" className="shrink-0 opacity-60" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Event</DialogTitle>
            <DialogDescription>Create a new calendar event</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleCreateSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
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
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                        <span className="text-muted-foreground ml-2 text-sm">Mark as all day</span>
                      </Label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                {!form.watch("isAllDay") && (
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <TimePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {!form.watch("isAllDay") && (
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
                {!form.watch("isAllDay") && (
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time</FormLabel>
                        <FormControl>
                          <TimePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!form.formState.isValid}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={(v) => setEditOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update or delete this event</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleUpdateSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
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
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                        <span className="text-muted-foreground ml-2 text-sm">Mark as all day</span>
                      </Label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                {!form.watch("isAllDay") && (
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <TimePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {!form.watch("isAllDay") && (
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
                {!form.watch("isAllDay") && (
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time</FormLabel>
                        <FormControl>
                          <TimePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!activeEvent}
                >
                  Delete
                </Button>
                <div className="grow" />
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!form.formState.isValid || !activeEvent}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { FullScreenCalendar }
