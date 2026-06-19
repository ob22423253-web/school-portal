// Inline alert box. Different from the floating toast — this one sits inside a
// page (e.g. above a form) to show a persistent message.

export default function Alert({ type = 'info', children, onClose }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm ${styles[type] || styles.info}`}
      role="alert"
    >
      <div>{children}</div>
      {onClose && (
        <button type="button" className="font-bold" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}
