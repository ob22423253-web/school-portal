// Compact pager. Pages list/result/user views. Disables prev/next at edges.

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> of{' '}
        <span className="font-medium text-slate-700">{totalPages}</span>
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={page <= 1}
          className="btn-secondary disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={next}
          disabled={page >= totalPages}
          className="btn-secondary disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
