// Severity badge component
export function SeverityBadge({ severity }) {
  const classes = {
    Fatal: 'bg-red-100 text-red-800',
    Serious: 'bg-amber-100 text-amber-800',
    Minor: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${classes[severity] || 'bg-slate-100 text-slate-700'}`}>
      {severity || 'Unknown'}
    </span>
  );
}

// Summary stat card
export function StatCard({ label, value, icon: Icon, color = 'blue', sub }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', val: 'text-blue-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', val: 'text-red-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', val: 'text-amber-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', val: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', val: 'text-slate-700' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={c.icon} />
      </div>
      <div>
        <div className={`text-2xl font-bold ${c.val}`}>{value ?? '—'}</div>
        <div className="text-sm text-slate-600 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 6 }) {
  return (
    <div className={`w-${size} h-${size} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

// Section title
export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-800">{children}</h2>
      {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="text-slate-300 mb-3" />
      <div className="font-medium text-slate-500">{title}</div>
      {description && <div className="text-sm text-slate-400 mt-1 max-w-xs">{description}</div>}
    </div>
  );
}

// Alert box
export function AlertBox({ type = 'info', title, message }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  return (
    <div className={`border rounded-lg p-4 text-sm ${styles[type]}`}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{message}</div>
    </div>
  );
}

// Pagination
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        Previous
      </button>
      <span className="text-sm text-slate-600 px-2">
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        Next
      </button>
    </div>
  );
}

// Severity color for charts
export const SEVERITY_COLORS = {
  Fatal: '#ef4444',
  Serious: '#f59e0b',
  Minor: '#22c55e',
};

export const CHART_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4', '#f97316'];
