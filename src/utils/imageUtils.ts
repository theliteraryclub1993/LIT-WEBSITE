import heic2any from 'heic2any'
import { ALLOWED_IMAGE_TYPES } from '@/utils/constants'

/**
 * Validates whether a file is an accepted image format (JPG, PNG, WebP, GIF, HEIC, HEIF).
 */
export function isImageFile(file: File): boolean {
    if (!file) return false
    if (ALLOWED_IMAGE_TYPES.includes(file.type as any)) return true
    if (/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(file.name)) return true
    return false
}

/**
 * Processes an image file. If the file is HEIC/HEIF format, converts it to standard JPEG.
 * Returns the original file if already in a standard image format.
 */
export async function processImageFile(file: File): Promise<File> {
    if (!file) throw new Error('No file provided')

    const isHeic = file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        /\.(heic|heif)$/i.test(file.name)

    if (isHeic) {
        try {
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            })

            const blobResult = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
            if (!blobResult) throw new Error('Conversion output was empty')

            const baseName = file.name.replace(/\.(heic|heif)$/i, '')
            return new File([blobResult], `${baseName}.jpg`, { type: 'image/jpeg' })
        } catch (err) {
            console.error('Failed to convert HEIC image:', err)
            throw new Error('Failed to process HEIC image. Please upload a JPG or PNG image.')
        }
    }

    return file
}
