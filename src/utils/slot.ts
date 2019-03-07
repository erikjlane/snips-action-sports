export const slot = {
    missing: (slot: any) => {
        if (Array.isArray(slot)) {
            return slot.length === 0
        } else {
            return !slot || slot.includes('unknownword')
        }
    }
}