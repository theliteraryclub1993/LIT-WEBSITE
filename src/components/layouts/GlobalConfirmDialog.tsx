import { useUIStore } from '@/store'
import { ConfirmDialog } from '@/components/ui'

/**
 * Global confirm dialog rendered once at the layout root.
 * Controlled entirely by useUIStore confirmDialog state.
 * Usage: useUIStore.getState().showConfirmDialog({ title: '...', message: '...', onConfirm: () => {} })
 */
export function GlobalConfirmDialog() {
    const confirmDialog = useUIStore((s) => s.confirmDialog)
    const hideConfirmDialog = useUIStore((s) => s.hideConfirmDialog)

    if (!confirmDialog) return null

    return (
        <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            cancelLabel={confirmDialog.cancelLabel}
            variant={confirmDialog.variant}
            isLoading={confirmDialog.isLoading}
            onConfirm={async () => {
                try {
                    await confirmDialog.onConfirm()
                } finally {
                    hideConfirmDialog()
                }
            }}
            onCancel={() => {
                hideConfirmDialog()
                confirmDialog.onCancel?.()
            }}
        />
    )
}