/**
 * Complete gallery image entity.
 */
export interface GalleryImage {
    id: string
    url: string
    thumbnail_url: string | null
    caption: string | null
    album: string | null
    category: string | null
    event_id: string | null
    uploaded_by: string
    order_index: number
    width: number | null
    height: number | null
    created_at: string
}

/**
 * Payload for creating a gallery image.
 */
export type GalleryImageCreateInput = Omit<GalleryImage, 'id' | 'created_at'>

/**
 * Payload for updating a gallery image.
 */
export type GalleryImageUpdateInput = Partial<Omit<GalleryImage, 'id' | 'uploaded_by' | 'created_at'>>

/**
 * Gallery image as displayed in grid/list views.
 */
export interface GalleryImageListItem {
    id: string
    url: string
    thumbnail_url: string | null
    caption: string | null
    album: string | null
    category: string | null
    width: number | null
    height: number | null
    aspect_ratio: number
}

/**
 * Gallery image with event context.
 */
export interface GalleryImageWithEvent extends GalleryImage {
    event_title?: string | null
    uploader_name?: string
}

/**
 * Album grouping with cover image and count.
 */
export interface GalleryAlbum {
    name: string
    count: number
    cover_url: string | null
    latest_image_at: string | null
}

/**
 * Category grouping with count.
 */
export interface GalleryCategory {
    name: string
    count: number
    cover_url: string | null
}

/**
 * Form values for uploading/editing a gallery image.
 */
export interface GalleryImageFormValues {
    caption: string
    album: string
    category: string
    event_id: string
    order_index: number
}

/**
 * Filters for listing gallery images.
 */
export interface GalleryFilters {
    album?: string
    category?: string
    event_id?: string
    search?: string
}

/**
 * Upload progress tracking.
 */
export interface UploadProgress {
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'success' | 'error'
    error?: string
    url?: string
    thumbnail_url?: string
}

/**
 * Lightbox state for full-screen image viewing.
 */
export interface LightboxState {
    isOpen: boolean
    images: Array<{ url: string; caption: string | null }>
    currentIndex: number
}

/**
 * Gallery statistics.
 */
export interface GalleryStats {
    total_images: number
    total_albums: number
    total_categories: number
    albums: GalleryAlbum[]
    categories: GalleryCategory[]
}

/**
 * Batch update payload for reordering.
 */
export interface GalleryReorderItem {
    id: string
    order_index: number
}