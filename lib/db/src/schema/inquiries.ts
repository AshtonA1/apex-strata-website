import { pgTable, text, serial, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { adminsTable } from "./admins";

export const INQUIRY_STATUSES = ["new", "read", "replied", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const inquiriesTable = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email").notNull(),
    message: text("message").notNull(),
    status: text("status").$type<InquiryStatus>().notNull().default("new"),
    // Whose mailbox this lands in. New website inquiries go to the owner; the owner can reassign.
    assignedAdminId: integer("assigned_admin_id").references(() => adminsTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (t) => [index("inquiries_assigned_idx").on(t.assignedAdminId), index("inquiries_status_idx").on(t.status)],
);

export const inquiryRepliesTable = pgTable(
  "inquiry_replies",
  {
    id: serial("id").primaryKey(),
    inquiryId: integer("inquiry_id")
      .notNull()
      .references(() => inquiriesTable.id, { onDelete: "cascade" }),
    adminId: integer("admin_id").references(() => adminsTable.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    // false when SMTP failed or isn't configured; `error` says why.
    delivered: boolean("delivered").notNull().default(false),
    error: text("error"),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (t) => [index("inquiry_replies_inquiry_idx").on(t.inquiryId)],
);

export type Inquiry = typeof inquiriesTable.$inferSelect;
export type InquiryReply = typeof inquiryRepliesTable.$inferSelect;
