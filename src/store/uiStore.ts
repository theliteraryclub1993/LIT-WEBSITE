import { create } from 'zustand'
import type { ConfirmDialogProps, LightboxState } from '@/types'

interface ModalState {
    id: string
    props?: Record<string, unknown>
}

interface UIState {
    // Sidebar
    sidebarCollapsed: boolean
    mobileSidebarOpen: boolean

    // Modals (stackable)
    activeModals: ModalState[]

    // Confirm dialog
    confirmDialog: ConfirmDialogProps | null

    // Lightbox
    lightbox: LightboxState

    // Command palette (for future use)
    commandPaletteOpen: boolean

    // Actions — Sidebar
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setMobileSidebarOpen: (open: boolean) => void

    // Actions — Modals
    openModal: (id: string, props?: Record<string, unknown>) => void
    closeModal: (id: string) => void
    closeAllModals: () => void
    isModalOpen: (id: string) => boolean

    // Actions — Confirm Dialog
    showConfirmDialog: (props: ConfirmDialogProps) => void
    hideConfirmDialog: () => void

    // Actions — Lightbox
    openLightbox: (images: Array<{ url: string; caption: string | null }>, index?: number) => void
    closeLightbox: () => void
    setLightboxIndex: (index: number) => void
    nextLightboxImage: () => void
    prevLightboxImage: () => void

    // Actions — Command Palette
    toggleCommandPalette: () => void
    setCommandPaletteOpen: (open: boolean) => void
}

const defaultLightbox: LightboxState = {
    isOpen: false,
    images: [],
    currentIndex: 0,
}

/**
 * Global UI state store.
 * Manages sidebar, modals, confirm dialogs, lightbox, and command palette.
 * Keeps component trees free of prop-drilling for cross-cutting UI concerns.
 */
export const useUIStore = create<UIState>((set, get) => ({
    // Sidebar defaults
    sidebarCollapsed: false,
    mobileSidebarOpen: false,

    // Modals defaults
    activeModals: [],

    // Confirm dialog defaults
    confirmDialog: null,

    // Lightbox defaults
    lightbox: { ...defaultLightbox },

    // Command palette defaults
    commandPaletteOpen: false,

    // --- Sidebar Actions ---

    toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

    setMobileSidebarOpen: (open) =>
        set({ mobileSidebarOpen: open }),

    // --- Modal Actions ---

    openModal: (id, props) =>
        set((state) => ({
            activeModals: [...state.activeModals, { id, props }],
        })),

    closeModal: (id) =>
        set((state) => ({
            activeModals: state.activeModals.filter((m) => m.id !== id),
        })),

    closeAllModals: () =>
        set({ activeModals: [] }),

    isModalOpen: (id) =>
        get().activeModals.some((m) => m.id === id),

    // --- Confirm Dialog Actions ---

    showConfirmDialog: (props) =>
        set({ confirmDialog: props }),

    hideConfirmDialog: () =>
        set({ confirmDialog: null }),

    // --- Lightbox Actions ---

    openLightbox: (images, index = 0) =>
        set({
            lightbox: {
                isOpen: true,
                images,
                currentIndex: index,
            },
        }),

    closeLightbox: () =>
        set({ lightbox: { ...defaultLightbox } }),

    setLightboxIndex: (index) =>
        set((state) => ({
            lightbox: {
                ...state.lightbox,
                currentIndex: Math.max(0, Math.min(index, state.lightbox.images.length - 1)),
            },
        })),

    nextLightboxImage: () =>
        set((state) => {
            const maxIndex = state.lightbox.images.length - 1
            const nextIndex = state.lightbox.currentIndex >= maxIndex ? 0 : state.lightbox.currentIndex + 1
            return {
                lightbox: { ...state.lightbox, currentIndex: nextIndex },
            }
        }),

    prevLightboxImage: () =>
        set((state) => {
            const maxIndex = state.lightbox.images.length - 1
            const prevIndex = state.lightbox.currentIndex <= 0 ? maxIndex : state.lightbox.currentIndex - 1
            return {
                lightbox: { ...state.lightbox, currentIndex: prevIndex },
            }
        }),

    // --- Command Palette Actions ---

    toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

    setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }),
}))