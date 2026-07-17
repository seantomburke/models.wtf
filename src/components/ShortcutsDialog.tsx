import { useEffect, useRef } from 'react'
import type { Shortcut } from '../lib/keyboard-shortcuts'

interface ShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: Shortcut[]
}

/**
 * Accessible modal dialog showing keyboard shortcuts
 * Opens/closes with ? key or Close button
 * Closes when pressing Escape or clicking backdrop
 */
export function ShortcutsDialog({ isOpen, onClose, shortcuts }: ShortcutsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Trap focus within dialog and close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleFocus = (e: FocusEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        closeButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('focusin', handleFocus)

    // Focus close button when dialog opens
    setTimeout(() => closeButtonRef.current?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('focusin', handleFocus)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="absolute left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-surface-raised p-6 shadow-lg dark:bg-surface-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-fg">
            Keyboard shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="rounded-lg p-1 text-fg-secondary transition-colors duration-150 hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className="flex items-center justify-between border-b border-line py-3 last:border-b-0"
            >
              <span className="text-sm text-fg-secondary">{shortcut.description}</span>
              <kbd className="inline-block rounded-lg border border-line bg-surface px-2 py-1 font-mono text-xs font-medium text-fg">
                {shortcut.label}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-fg-muted">
          Shortcuts are disabled when typing in text fields.
        </p>
      </div>
    </div>
  )
}
