/**
 * Post status values.
 */
export type PostStatus = 'draft' | 'published' | 'archived'

/**
 * Complete post entity (blog article).
 */
export interface Post {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  cover_image: string | null
  author_id: string
  author_name: string
  status: PostStatus
  category: string | null
  tags: string[] | null
  read_time_minutes: number | null
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Payload for creating a new post.
 */
export type PostCreateInput = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'published_at'>

/**
 * Payload for updating a post.
 */
export type PostUpdateInput = Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>

/**
 * Post as displayed in list/card views (lighter payload).
 */
export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author_name: string
  status: PostStatus
  category: string | null
  tags: string[] | null
  read_time_minutes: number | null
  is_featured: boolean
  published_at: string | null
}

/**
 * Post detail with author profile joined in.
 */
export interface PostDetail extends Post {
  author_avatar_url?: string | null
  author_bio?: string | null
  related_posts?: PostListItem[]
}

/**
 * Form values for creating/editing a post.
 */
export interface PostFormValues {
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  author_id: string
  author_name: string
  status: PostStatus
  category: string
  tags: string
  is_featured: boolean
}

/**
 * Filters for listing posts.
 */
export interface PostFilters {
  status?: PostStatus | PostStatus[]
  category?: string
  tag?: string
  search?: string
  author_id?: string
  is_featured?: boolean
  date_from?: string
  date_to?: string
}

/**
 * Sort options for post listing.
 */
export interface PostSort {
  column: 'published_at' | 'created_at' | 'title'
  ascending: boolean
}

/**
 * Blog category with post count.
 */
export interface BlogCategory {
  name: string
  count: number
}

/**
 * Tag with post count.
 */
export interface BlogTag {
  name: string
  count: number
}

/**
 * Blog statistics for dashboard.
 */
export interface BlogStats {
  total: number
  published: number
  draft: number
  archived: number
  featured: number
  categories: BlogCategory[]
  tags: BlogTag[]
  total_read_time: number
  average_read_time: number
}

/**
 * Editor block for rich text editing.
 */
export interface EditorBlock {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'quote' | 'code' | 'image' | 'list' | 'divider'
  content: string
  metadata?: Record<string, unknown>
}
