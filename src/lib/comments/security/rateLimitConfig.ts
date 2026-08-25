export const COMMENT_RATE_LIMITS = {
  guest: {
    limit: 1,
    windowSeconds: 10,
  },

  user: {
    limit: 5,
    windowSeconds: 60,
  },

  moderator: {
    limit: 1000,
    windowSeconds: 60,
  },
} as const;
