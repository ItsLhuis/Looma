/* eslint-disable */

import { relations, sql } from "drizzle-orm"
import { blob, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

import { type IconProps } from "@/components/ui"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull()
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
})

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    uniqueIndex("accounts_provider_account_unique").on(table.providerId, table.accountId),
    index("accounts_user_id_idx").on(table.userId)
  ]
)

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    uniqueIndex("verifications_identifier_value_unique").on(table.identifier, table.value),
    index("verifications_expires_at_idx").on(table.expiresAt)
  ]
)

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#6B7280"),
    icon: text("icon").$type<IconProps["name"]>(),
    parentId: text("parent_id").references((): any => categories.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("categories_user_id_idx").on(table.userId),
    uniqueIndex("categories_user_name_unique").on(table.userId, table.name)
  ]
)

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").default("#6B7280"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("tags_user_id_idx").on(table.userId),
    uniqueIndex("tags_user_name_unique").on(table.userId, table.name)
  ]
)

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content"),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    summary: text("summary"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false).notNull(),
    isArchived: integer("is_archived", { mode: "boolean" }).default(false).notNull(),
    priority: text("priority")
      .$type<"none" | "low" | "medium" | "high" | "urgent">()
      .default("none")
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_category_id_idx").on(table.categoryId),
    index("notes_created_at_idx").on(table.createdAt),
    index("notes_priority_idx").on(table.priority),
    index("notes_is_favorite_idx").on(table.isFavorite),
    index("notes_is_archived_idx").on(table.isArchived)
  ]
)

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    status: text("status")
      .$type<"pending" | "inProgress" | "completed" | "cancelled" | "onHold">()
      .notNull()
      .default("pending"),
    priority: text("priority")
      .$type<"none" | "low" | "medium" | "high" | "urgent">()
      .default("none")
      .notNull(),
    dueDate: integer("due_date", { mode: "timestamp" }),
    estimatedDuration: integer("estimated_duration"),
    position: integer("position").default(0).notNull(),
    parentTaskId: text("parent_task_id").references((): any => tasks.id, { onDelete: "set null" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("tasks_user_id_idx").on(table.userId),
    index("tasks_status_idx").on(table.status),
    index("tasks_priority_idx").on(table.priority),
    index("tasks_due_date_idx").on(table.dueDate),
    index("tasks_parent_task_id_idx").on(table.parentTaskId),
    index("tasks_position_idx").on(table.position)
  ]
)

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }),
    isAllDay: integer("is_all_day", { mode: "boolean" }).default(false).notNull(),
    googleCalendarId: text("google_calendar_id"),
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("events_user_id_idx").on(table.userId),
    index("events_start_time_idx").on(table.startTime),
    index("events_end_time_idx").on(table.endTime),
    index("events_google_calendar_id_idx").on(table.googleCalendarId),
    index("events_is_all_day_idx").on(table.isAllDay)
  ]
)

export const memories = sqliteTable(
  "memories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    embedding: blob("embedding"),
    importance: text("importance")
      .$type<"low" | "medium" | "high" | "critical">()
      .default("medium")
      .notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("memories_user_id_idx").on(table.userId),
    index("memories_importance_idx").on(table.importance),
    index("memories_is_active_idx").on(table.isActive)
  ]
)

export const noteAttachments = sqliteTable(
  "note_attachments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("note_attachments_user_id_idx").on(table.userId),
    index("note_attachments_note_id_idx").on(table.noteId),
    index("note_attachments_mime_type_idx").on(table.mimeType)
  ]
)

export const taskAttachments = sqliteTable(
  "task_attachments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("task_attachments_user_id_idx").on(table.userId),
    index("task_attachments_task_id_idx").on(table.taskId),
    index("task_attachments_mime_type_idx").on(table.mimeType)
  ]
)

export const eventAttachments = sqliteTable(
  "event_attachments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    index("event_attachments_user_id_idx").on(table.userId),
    index("event_attachments_event_id_idx").on(table.eventId),
    index("event_attachments_mime_type_idx").on(table.mimeType)
  ]
)

export const noteTags = sqliteTable(
  "note_tags",
  {
    id: text("id").primaryKey(),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    uniqueIndex("note_tags_unique_idx").on(table.noteId, table.tagId),
    index("note_tags_tag_id_idx").on(table.tagId)
  ]
)

export const taskTags = sqliteTable(
  "task_tags",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull()
  },
  (table) => [
    uniqueIndex("task_tags_unique_idx").on(table.taskId, table.tagId),
    index("task_tags_tag_id_idx").on(table.tagId)
  ]
)

export const userRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  tags: many(tags),
  notes: many(notes),
  tasks: many(tasks),
  events: many(events),
  noteAttachments: many(noteAttachments),
  taskAttachments: many(taskAttachments),
  eventAttachments: many(eventAttachments),
  memories: many(memories),
  sessions: many(sessions),
  accounts: many(accounts)
}))

export const categoryRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  notes: many(notes),
  tasks: many(tasks),
  events: many(events)
}))

export const tagRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id]
  }),
  noteTags: many(noteTags),
  taskTags: many(taskTags)
}))

export const noteRelations = relations(notes, ({ one, many }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [notes.categoryId],
    references: [categories.id]
  }),
  noteAttachments: many(noteAttachments),
  noteTags: many(noteTags)
}))

export const taskRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id]
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id]
  }),
  subtasks: many(tasks),
  taskAttachments: many(taskAttachments),
  taskTags: many(taskTags)
}))

export const eventRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [events.categoryId],
    references: [categories.id]
  }),
  eventAttachments: many(eventAttachments)
}))

export const memoryRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id]
  })
}))

export const noteAttachmentRelations = relations(noteAttachments, ({ one }) => ({
  user: one(users, {
    fields: [noteAttachments.userId],
    references: [users.id]
  }),
  note: one(notes, {
    fields: [noteAttachments.noteId],
    references: [notes.id]
  })
}))

export const taskAttachmentRelations = relations(taskAttachments, ({ one }) => ({
  user: one(users, {
    fields: [taskAttachments.userId],
    references: [users.id]
  }),
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id]
  })
}))

export const eventAttachmentRelations = relations(eventAttachments, ({ one }) => ({
  user: one(users, {
    fields: [eventAttachments.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [eventAttachments.eventId],
    references: [events.id]
  })
}))

export const noteTagRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id]
  }),
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id]
  })
}))

export const taskTagRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, {
    fields: [taskTags.taskId],
    references: [tasks.id]
  }),
  tag: one(tags, {
    fields: [taskTags.tagId],
    references: [tags.id]
  })
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}))
