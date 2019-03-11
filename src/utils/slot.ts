export const slot = {
    missing: (slot: string) => {
        return !slot || slot.includes('unknownword')
    }
}