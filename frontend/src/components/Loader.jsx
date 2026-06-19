// Simple spinner used on every async action so the UI always shows progress.

export default function Loader({ label = 'Loading', size = 'md', inline = false }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  const wrapper = inline
    ? 'inline-flex items-center gap-2 text-sm text-slate-600'
    : 'flex items-center justify-center gap-3 py-8 text-sm text-slate-600';
  return (
    <div className={wrapper} role="status">
      <span
        className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 ${sizes[size]}`}
      />
      <span>{label}…</span>
    </div>
  );
}
