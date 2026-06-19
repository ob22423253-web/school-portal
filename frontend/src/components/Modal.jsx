// Plain modal dialog. Used for create/edit forms and confirm-delete prompts.

import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, footer }) {
  // Close on Escape key for a bit of keyboard friendliness.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700" aria-label="Close">
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 px-5 py-3 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
