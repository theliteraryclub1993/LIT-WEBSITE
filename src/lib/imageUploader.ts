import { uploadFile } from './supabase'

export interface SlideItem {
    id: string
    url: string
    title?: string
    display_order: number
    is_active: boolean
    created_at: string
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Validate image file format and size limits.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
        return { valid: false, error: 'No file provided' }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXTENSIONS.includes(ext) && !file.type.startsWith('image/')) {
        return { valid: false, error: `Invalid image format (${ext || 'unknown'}). Allowed: JPG, PNG, WebP, GIF` }
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
        return { valid: false, error: `File "${file.name}" is too large (${sizeMb}MB). Maximum allowed is 10MB.` }
    }

    return { valid: true }
}

/**
 * Filter out duplicate files based on name and file size signature.
 */
export function deduplicateFiles(files: File[]): File[] {
    const seen = new Set<string>()
    return files.filter(file => {
        const signature = `${file.name.toLowerCase()}_${file.size}`
        if (seen.has(signature)) {
            return false
        }
        seen.add(signature)
        return true
    })
}

/**
 * Convert a File into a base64 Data URL string.
 */
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
    })
}

/**
 * Compress an image File client-side using HTML5 Canvas.
 * Reduces file payload size by ~80% for fast uploads and minimal storage usage.
 */
export async function compressImage(
    file: File,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85
): Promise<File> {
    // Skip SVG and GIF animations to preserve vectors and animations
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'svg' || ext === 'gif' || file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return file
    }

    return new Promise((resolve) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)

            let width = img.width
            let height = img.height

            // Calculate resized aspect ratio if image exceeds max dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height)
                width = Math.round(width * ratio)
                height = Math.round(height * ratio)
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                resolve(file)
                return
            }

            ctx.drawImage(img, 0, 0, width, height)

            const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file)
                        return
                    }

                    const compressedFile = new File([blob], file.name, {
                        type: mimeType,
                        lastModified: Date.now(),
                    })

                    console.log(
                        `[compressImage] "${file.name}" compressed: ${(file.size / 1024).toFixed(0)}KB -> ${(compressedFile.size / 1024).toFixed(0)}KB`
                    )
                    resolve(compressedFile)
                },
                mimeType,
                quality
            )
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve(file)
        }

        img.src = url
    })
}

/**
 * Upload multiple files in parallel with client-side compression, progress callback,
 * and dual-layer fallback to Data URLs if storage fails.
 */
export async function uploadBatchImages(
    bucket: string,
    folder: string,
    files: File[],
    onProgress?: (completed: number, total: number, currentFileName: string) => void
): Promise<string[]> {
    if (!files || files.length === 0) return []

    // 1. Deduplicate & validate
    const uniqueFiles = deduplicateFiles(files)
    const validFiles: File[] = []

    for (const f of uniqueFiles) {
        const val = validateImageFile(f)
        if (val.valid) {
            validFiles.push(f)
        } else {
            console.warn(`[uploadBatchImages] File rejected: ${val.error}`)
        }
    }

    if (validFiles.length === 0) return []

    let completed = 0
    const total = validFiles.length
    const now = Date.now()

    // 2. Compress and upload files in parallel
    const promises = validFiles.map(async (file, i) => {
        try {
            console.log(`[uploadBatchImages] Processing (${i + 1}/${total}): ${file.name}`)
            const compressed = await compressImage(file)
            const rand = Math.random().toString(36).substring(2, 7)
            const path = `${folder}/${now}_${i}_${rand}_${compressed.name}`

            let url = await uploadFile(bucket, path, compressed, { upsert: true })

            // Dual-layer fallback to Data URL if storage bucket fails
            if (!url) {
                console.warn(`[uploadBatchImages] Storage upload failed for ${file.name}, using Data URL fallback.`)
                url = await fileToDataUrl(compressed)
            }

            completed++
            if (onProgress) {
                onProgress(completed, total, file.name)
            }

            return url
        } catch (err) {
            console.error(`[uploadBatchImages] Error processing ${file.name}:`, err)
            try {
                const dataUrl = await fileToDataUrl(file)
                completed++
                if (onProgress) {
                    onProgress(completed, total, file.name)
                }
                return dataUrl
            } catch {
                completed++
                if (onProgress) {
                    onProgress(completed, total, file.name)
                }
                return null
            }
        }
    })

    const results = await Promise.all(promises)
    return results.filter((url): url is string => Boolean(url))
}

/**
 * Normalize database value (plain string, JSON string, string array, or SlideItem array)
 * into a canonical SlideItem[] list.
 */
export function normalizeSlideItems(raw: any): SlideItem[] {
    if (!raw) return []

    let data = raw
    if (typeof raw === 'string') {
        try {
            data = JSON.parse(raw)
        } catch {
            return [{
                id: `slide_${Date.now()}_0`,
                url: raw,
                display_order: 0,
                is_active: true,
                created_at: new Date().toISOString()
            }]
        }
    }

    if (Array.isArray(data)) {
        return data.map((item, idx) => {
            if (typeof item === 'string') {
                return {
                    id: `slide_${Date.now()}_${idx}`,
                    url: item,
                    display_order: idx,
                    is_active: true,
                    created_at: new Date().toISOString()
                }
            }
            if (typeof item === 'object' && item !== null && item.url) {
                return {
                    id: item.id || `slide_${Date.now()}_${idx}`,
                    url: item.url,
                    title: item.title || '',
                    display_order: typeof item.display_order === 'number' ? item.display_order : idx,
                    is_active: item.is_active !== false,
                    created_at: item.created_at || new Date().toISOString()
                }
            }
            return null
        }).filter((item): item is SlideItem => Boolean(item))
    }

    return []
}
