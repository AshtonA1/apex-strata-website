// Small fetch wrapper for the admin API. Same origin (/api), so the httpOnly session cookie is
// sent automatically. The CSRF token lives only in memory and is re-fetched from /admin/me on reload.

let csrfToken = "";
let onUnauthorized: (() => void) | null = null;

export const setCsrfToken = (t: string) => {
  csrfToken = t;
};
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;
  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        ...(body !== undefined && { "content-type": "application/json" }),
        ...(csrfToken && { "x-csrf-token": csrfToken }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/admin/login") && !path.startsWith("/admin/me")) onUnauthorized?.();
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status, data?.code, data);
  }
  return data as T;
}

// ---- Types shared by the admin pages ----
export type Role = "owner" | "admin";
export type Me = { id: number; email: string; name: string; role: Role; mustChangePassword: boolean };
export type ProjectStatus = "Completed" | "Ongoing" | "Pending";
export type AdminProject = {
  id: number;
  title: string;
  client: string;
  clients: string[];
  location: string;
  status: ProjectStatus;
  desc: string;
  sortOrder: number;
  updatedAt: string;
};
export type InquiryStatus = "new" | "read" | "replied" | "archived";
export type InquiryRow = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  assignedAdminId: number | null;
  assignedName: string | null;
};
export type InquiryDetail = {
  inquiry: Omit<InquiryRow, "assignedName"> & { readAt: string | null };
  replies: { id: number; subject: string; body: string; delivered: boolean; error: string | null; sentAt: string; adminName: string | null }[];
  emailConfigured: boolean;
};
export type AdminAccount = {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};
export type Summary = {
  projects: number;
  projectsByStatus: Partial<Record<ProjectStatus, number>>;
  unreadInquiries: number;
  emailConfigured: boolean;
};

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never";
