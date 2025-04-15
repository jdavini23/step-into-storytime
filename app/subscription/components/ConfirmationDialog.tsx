import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, title, description, onConfirm, onCancel, isLoading }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return;
    const focusableEls = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls?.[0];
    const lastEl = focusableEls?.[focusableEls.length - 1];
    function trap(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (focusableEls && focusableEls.length === 1) {
          e.preventDefault();
          (firstEl as HTMLElement)?.focus();
        } else if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            (lastEl as HTMLElement)?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            (firstEl as HTMLElement)?.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', trap);
    // Focus the dialog
    firstEl?.focus();
    return () => document.removeEventListener('keydown', trap);
  }, [open, onCancel]);

  if (!open) return null;

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity" aria-hidden="true" />
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
        tabIndex={-1}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center outline-none"
      >
        <h2 id="dialog-title" className="text-2xl font-bold mb-2 text-center">{title}</h2>
        <p id="dialog-desc" className="text-slate-600 dark:text-slate-300 mb-6 text-center">{description}</p>
        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            type="button"
          >
            {isLoading ? 'Loading...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  // Portal to body
  return typeof window !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default React.memo(ConfirmationDialog);
