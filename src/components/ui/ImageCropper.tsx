import { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCw, X, Check } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ImageCropperProps {
    isOpen: boolean
    onClose: () => void
    imageSrc: string
    onCropComplete: (croppedBlob: Blob) => void
    aspectRatio?: number // width / height, e.g. 3/4 = 0.75
}

export function ImageCropper({
    isOpen,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio = 3 / 4,
}: ImageCropperProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [img, setImg] = useState<HTMLImageElement | null>(null)
    const [scale, setScale] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [offsetX, setOffsetX] = useState(0)
    const [offsetY, setOffsetY] = useState(0)

    const isDragging = useRef(false)
    const dragStart = useRef({ x: 0, y: 0 })

    // Viewport dimensions (300 x 400 for 3:4 ratio)
    const viewportWidth = 300
    const viewportHeight = Math.round(viewportWidth / aspectRatio) // 400px

    // Crop window inside canvas (240px x 320px)
    const cropWidth = 240
    const cropHeight = Math.round(cropWidth / aspectRatio) // 320px

    // Load image
    useEffect(() => {
        if (!imageSrc) return
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => {
            setImg(image)
            // Reset state
            setScale(1)
            setRotation(0)
            setOffsetX(0)
            setOffsetY(0)
        }
        image.src = imageSrc
    }, [imageSrc])

    // Draw logic
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !img) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Draw image layer
        ctx.save()
        // Translate to center
        ctx.translate(width / 2, height / 2)
        // Translate drag offset
        ctx.translate(offsetX, offsetY)
        // Rotate
        ctx.rotate((rotation * Math.PI) / 180)
        // Scale
        ctx.scale(scale, scale)

        // Calculate scale to cover crop window
        const scaleToCover = Math.max(cropWidth / img.width, cropHeight / img.height)
        const w = img.width * scaleToCover
        const h = img.height * scaleToCover

        ctx.drawImage(img, -w / 2, -h / 2, w, h)
        ctx.restore()

        // Draw overlay mask (dark area outside 3:4 rectangle)
        ctx.save()
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)'
        ctx.beginPath()
        ctx.rect(0, 0, width, height)

        // Subtract rounded rectangle crop area (240x320)
        const cropX = (width - cropWidth) / 2
        const cropY = (height - cropHeight) / 2
        const radius = 12

        ctx.roundRect(cropX, cropY, cropWidth, cropHeight, radius)
        ctx.closePath()
        ctx.fill('evenodd')
        ctx.restore()

        // Draw crop area border
        ctx.strokeStyle = '#FF6B00' // orange-primary
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.roundRect(cropX, cropY, cropWidth, cropHeight, radius)
        ctx.stroke()

        // Grid guide lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        
        // Vertical grid lines
        ctx.beginPath()
        ctx.moveTo(cropX + cropWidth / 3, cropY)
        ctx.lineTo(cropX + cropWidth / 3, cropY + cropHeight)
        ctx.moveTo(cropX + (2 * cropWidth) / 3, cropY)
        ctx.lineTo(cropX + (2 * cropWidth) / 3, cropY + cropHeight)
        // Horizontal grid lines
        ctx.moveTo(cropX, cropY + cropHeight / 3)
        ctx.lineTo(cropX + cropWidth, cropY + cropHeight / 3)
        ctx.moveTo(cropX, cropY + (2 * cropHeight) / 3)
        ctx.lineTo(cropX + cropWidth, cropY + (2 * cropHeight) / 3)
        ctx.stroke()
        ctx.setLineDash([])
    }, [img, scale, rotation, offsetX, offsetY, cropWidth, cropHeight])

    // Mouse handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        isDragging.current = true
        dragStart.current = { x: e.clientX - offsetX, y: e.clientY - offsetY }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging.current) return
        setOffsetX(e.clientX - dragStart.current.x)
        setOffsetY(e.clientY - dragStart.current.y)
    }

    const handleMouseUpOrLeave = () => {
        isDragging.current = false
    }

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        const touch = e.touches[0]
        if (!touch) return
        isDragging.current = true
        dragStart.current = {
            x: touch.clientX - offsetX,
            y: touch.clientY - offsetY,
        }
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDragging.current) return
        const touch = e.touches[0]
        if (!touch) return
        setOffsetX(touch.clientX - dragStart.current.x)
        setOffsetY(touch.clientY - dragStart.current.y)
    }

    const handleTouchEnd = () => {
        isDragging.current = false
    }

    // Zoom & Rotation controls
    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 4))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 1))
    const rotate = () => setRotation(prev => (prev + 90) % 360)

    const handleSave = () => {
        if (!img) return

        // High resolution export: 600 x 800 (3:4 ratio)
        const exportWidth = 600
        const exportHeight = 800
        const cropCanvas = document.createElement('canvas')
        cropCanvas.width = exportWidth
        cropCanvas.height = exportHeight
        const cropCtx = cropCanvas.getContext('2d')
        if (!cropCtx) return

        // Compute coordinate scale ratio between screen canvas crop window (240x320) and export canvas (600x800)
        const ratio = exportWidth / cropWidth // 600 / 240 = 2.5

        cropCtx.translate(exportWidth / 2, exportHeight / 2)
        cropCtx.translate(offsetX * ratio, offsetY * ratio)
        cropCtx.rotate((rotation * Math.PI) / 180)
        cropCtx.scale(scale * ratio, scale * ratio)

        const scaleToCover = Math.max(cropWidth / img.width, cropHeight / img.height)
        const w = img.width * scaleToCover
        const h = img.height * scaleToCover

        cropCtx.drawImage(img, -w / 2, -h / 2, w, h)

        cropCanvas.toBlob(
            blob => {
                if (blob) {
                    onCropComplete(blob)
                }
            },
            'image/jpeg',
            0.92
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crop Profile Image (3:4 Ratio)" size="sm">
            <div className="flex flex-col items-center gap-5 py-2">
                {/* Canvas container */}
                <div className="relative rounded-xl overflow-hidden border border-dark-700 bg-dark-950 cursor-move shadow-2xl">
                    <canvas
                        ref={canvasRef}
                        width={viewportWidth}
                        height={viewportHeight}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="block touch-none"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 border border-dark-700 text-[10px] text-orange-primary font-mono pointer-events-none uppercase tracking-wider">
                        3:4 Ratio Crop
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full space-y-4">
                    {/* Zoom slider */}
                    <div className="flex items-center gap-3">
                        <ZoomOut size={16} className="text-dark-400" />
                        <input
                            type="range"
                            min="1"
                            max="4"
                            step="0.05"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="flex-1 accent-orange-primary bg-dark-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <ZoomIn size={16} className="text-dark-400" />
                    </div>

                    {/* Button Controls */}
                    <div className="flex justify-center gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={zoomOut}
                            leftIcon={<ZoomOut size={14} />}
                            className="cursor-pointer"
                        >
                            Zoom Out
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={zoomIn}
                            leftIcon={<ZoomIn size={14} />}
                            className="cursor-pointer"
                        >
                            Zoom In
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={rotate}
                            leftIcon={<RotateCw size={14} />}
                            className="cursor-pointer"
                        >
                            Rotate
                        </Button>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="w-full flex justify-end gap-3 pt-4 border-t border-dark-800">
                    <Button variant="outline" size="sm" onClick={onClose} leftIcon={<X size={14} />} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<Check size={14} />} className="cursor-pointer">
                        Apply 3:4 Crop
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
