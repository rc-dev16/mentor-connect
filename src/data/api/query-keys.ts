export const queryKeys = {
  auth: {
    session: (userId?: string) => ["auth", "session", userId] as const,
  },
  dashboard: {
    summary: (userId?: string) => ["dashboard", "summary", userId] as const,
  },
  users: {
    profile: (userId?: string) => ["users", "profile", userId] as const,
    mentor: (userId?: string) => ["users", "mentor", userId] as const,
    mentees: (userId?: string) => ["users", "mentees", userId] as const,
  },
  meetings: {
    all: (userId?: string, status?: string) => ["meetings", "all", userId, status] as const,
    mentee: (userId?: string, status?: string) => ["meetings", "mentee", userId, status] as const,
    detail: (id: string) => ["meetings", "detail", id] as const,
    menteesList: (userId?: string) => ["meetings", "menteesList", userId] as const,
  },
  notifications: {
    all: (userId?: string) => ["notifications", "all", userId] as const,
    unreadCount: (userId?: string) => ["notifications", "unreadCount", userId] as const,
  },
  sessionRequests: {
    all: (userId?: string, status?: string) => ["sessionRequests", "all", userId, status] as const,
  },
  resources: {
    all: (userId?: string) => ["resources", "all", userId] as const,
  },
  personalInfo: {
    own: (userId?: string) => ["personalInfo", "own", userId] as const,
    mentee: (menteeId: string) => ["personalInfo", "mentee", menteeId] as const,
  },
  reports: {
    all: (userId?: string) => ["reports", "all", userId] as const,
  },
};
