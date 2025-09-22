/* eslint-disable */

import { relations, sql } from "drizzle-orm"
import { blob, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

import { randomUUID } from "crypto"

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

export const notes = sqliteTable(
  "notes",
  {
    id: text("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content"),
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
    index("notes_created_at_idx").on(table.createdAt),
    index("notes_priority_idx").on(table.priority),
    index("notes_is_favorite_idx").on(table.isFavorite),
    index("notes_is_archived_idx").on(table.isArchived)
  ]
)

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
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
    parentTaskId: text("parent_task_id", { length: 36 }).references((): any => tasks.id, {
      onDelete: "cascade"
    }),
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
    id: text("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }),
    isAllDay: integer("is_all_day", { mode: "boolean" }).default(false).notNull(),
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
    index("events_is_all_day_idx").on(table.isAllDay)
  ]
)

export const memories = sqliteTable(
  "memories",
  {
    id: text("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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

export const userRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  tasks: many(tasks),
  events: many(events),
  memories: many(memories),
  sessions: many(sessions),
  accounts: many(accounts)
}))

export const noteRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id]
  })
}))

export const taskRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id]
  }),
  subtasks: many(tasks)
}))

export const eventRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  })
}))

export const memoryRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id]
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
