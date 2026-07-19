export const APP_NAME = 'The Literary Club'
export const APP_TAGLINE = 'Where Words Come Alive'
export const APP_DESCRIPTION = 'A premium community for writers, readers, and storytellers.'

export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',
  EVENT_MANAGER: 'eventManager',
  CONTENT_EDITOR: 'contentEditor',
} as const

export const ROLE_LABELS: Record<string, string> = {
  superAdmin: 'Super Admin',
  admin: 'Admin',
  eventManager: 'Event Manager',
  contentEditor: 'Content Editor',
} as const

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const

export const AUDITION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  IN_REVIEW: 'in_review',
  RESULTS_OUT: 'results_out',
} as const

export const AUDITION_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
  in_review: 'Under Review',
  results_out: 'Results Out',
} as const

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  SELECTED: 'selected',
} as const

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  selected: 'Selected',
} as const

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const POST_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
} as const

export const PAGE_SIZES = [10, 25, 50, 100] as const

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  EVENT_IMAGES: 'event-images',
  GALLERY: 'gallery',
  POST_IMAGES: 'post-images',
  CERTIFICATES: 'certificates',
  DOCUMENTS: 'documents',
} as const

// ... (keep all existing constants from Phase 1)

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

export const MAX_FILE_SIZES: Record<StorageBucket, number> = {
  avatars: 10 * 1024 * 1024,           // 10MB
  'event-images': 5 * 1024 * 1024,     // 5MB
  gallery: 10 * 1024 * 1024,           // 10MB
  'post-images': 5 * 1024 * 1024,      // 5MB
  certificates: 2 * 1024 * 1024,       // 2MB
  documents: 10 * 1024 * 1024,         // 10MB
} as const

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}