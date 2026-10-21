import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { adminsTable } from "./admins";

export const PROJECT_STATUSES = ["Completed", "Ongoing", "Pending"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  // Free-text line shown under the title (e.g. "Alpha Minerals (Pvt) Ltd").
  client: text("client").notNull(),
  // Client names used to look up logos on the website. Names that match a known
  // client (see CLIENTS in the web app's content.ts) get their logo; others show as text.
  clients: text("clients").array().notNull().default([]),
  location: text("location").notNull(),
  status: text("status").$type<ProjectStatus>().notNull().default("Completed"),
  description: text("description").notNull(),
  // Lower number = shown first.
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: integer("created_by").references(() => adminsTable.id, { onDelete: "set null" }),
  updatedBy: integer("updated_by").references(() => adminsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projectsTable.$inferSelect;
