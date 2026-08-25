/* ===========================================================
   COMMENTS
   =========================================================== */

export type CommentRow = Omit<
  DatabaseComment,
  | "depth"
  | "guest_id"
  | "edited"
  | "replies_count"
  | "replies"
  | "author"
  | "user"
>;

export type CommentStatus = "approved" | "pending" | "deleted";
export type VoteType = -1 | 0 | 1;

export interface CommentAuthor {
  id: string | null;
  name: string;
  avatar: string | null;
  isGuest: boolean;
}

// export interface Comment {
//   /* ---------- IDs ---------- */

//   id: string;

//   episodeId: string;

//   parentId: string | null;

//   depth: 0 | 1 | 2;

//   /* ---------- Author ---------- */

//   author: CommentAuthor;

//   /* ---------- Content ---------- */

//   content: string;

//   status: CommentStatus;

//   edited: boolean;

//   createdAt: Date;

//   updatedAt: Date;

//   deletedAt: Date | null;

//   /* ---------- Counts ---------- */

//   likes: number;

//   dislikes: number;

//   repliesCount: number;

//   /* ---------- Current User ---------- */

//   myVote: VoteType;

//   canEdit: boolean;

//   canDelete: boolean;

//   canReply: boolean;

//   /* ---------- Moderation ---------- */

//   isPinned: boolean;

//   isLocked: boolean;

//   spamScore: number;

//   reportsCount: number;

//   /* ---------- UI ---------- */

//   isDeleted: boolean;

//   isPending: boolean;
// }

export interface Comment {
  id: string; // uuid
  episode_id: string;
  parent_id?: string | null;
  depth: number; // smallint
  user_id?: string | null;
  guest_name?: string | null;
  content: string;
  likes_count: number;
  dislikes_count: number;
  replies_count: number;
  status: "approved" | "pending" | "deleted";
  edited: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  guest_id?: string | null;
  ip_hash?: string | null;
  user_agent?: string | null;
  guest_email_hash?: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  deleted_at?: string | null; // timestamp
  guest_name_normalized?: string | null;
  spam_score: number;
  reports_count: number;
  my_vote: VoteType;
  myVote?: VoteType;
  user_name: string | null;
}

/*---------------------------------------------*/

export interface CreateCommentInput {
  episodeId: string;

  parentId: string | null;

  content: string;

  guestName?: string;

  guestEmail?: string;

  turnstileToken?: string;
}

export interface EditCommentInput {
  commentId: string;

  content: string;
}

export interface VoteCommentInput {
  commentId: string;

  vote: VoteType;
}

export interface VoteResponse {
  likes: number;
  dislikes: number;
  myVote: VoteType;
}

export interface ReportCommentInput {
  commentId: string;

  reason: string;
}

export interface GuestSession {
  guestId: string;
  token: string;
  name: string;
}

export interface CommentsState {
  commentsById: Map<string, Comment>;

  rootCommentIds: string[];

  replyIdsByParent: Map<string, string[]>;

  loading: boolean;

  loadingMore: boolean;

  openMenuCommentId: string | null;

  votingCommentIds: Set<string>;

  initialized: boolean;

  hasMore: boolean;

  nextCursor: CommentsCursor | null;

  total: number;

  error: string | null;

  sort: CommentSort;

  turnstileToken: string;

  realtimeConnected: boolean;
}

export interface CommentsCursor {
  score: number;
  createdAt: string;
  id: string;
}

export interface CommentsPage {
  commentsById: Record<string, Comment>;

  rootCommentIds: string[];

  replyIdsByParent: Record<string, string[]>;

  nextCursor: CommentsCursor | null;

  hasMore: boolean;
}

export type CommentRealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface OptimisticComment {
  tempId: string;

  realId?: string;
}

export interface DatabaseComment {
  id: string;

  episode_id: string;

  parent_id: string | null;

  depth: 0 | 1 | 2;

  user_id: string | null;

  guest_name: string | null;

  guest_id: string | null;

  content: string;

  status: CommentStatus;

  edited: boolean;

  likes_count: number;

  dislikes_count: number;

  replies_count: number;

  is_pinned: boolean;

  is_locked: boolean;

  created_at: string;

  updated_at: string;

  deleted_at: string | null;

  /* ---------- Computed by RPC ---------- */

  my_vote: VoteType;

  can_edit: boolean;

  can_delete: boolean;

  can_reply: boolean;

  /*guest comment*/
  ip_hash: string | null;

  user_agent: string | null;

  guest_name_normalized: string | null;
}

export interface DatabaseVote {
  comment_id: string;

  user_id: string | null;

  ip_hash: string | null;

  vote: VoteType;
}

export type CommentSort = "top" | "newest" | "oldest";

export interface CommentRealtimePayload {
  type: "INSERT" | "UPDATE" | "DELETE";

  comment: Comment;
}

export interface CreateCommentApiInput {
  episodeId: string;

  parentId: string | null;

  content: string;

  guestId?: string | null;

  guestName?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;

  data?: T;

  error?: string;

  code?: string;
}
