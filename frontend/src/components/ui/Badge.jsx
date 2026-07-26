const variants = {
  lost: 'border border-rose-500/30 bg-rose-500/15 text-rose-300',
  found: 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  verified: 'border border-indigo-500/30 bg-indigo-500/15 text-indigo-300',
  pending: 'border border-amber-500/30 bg-amber-500/15 text-amber-300'
};

export default function Badge({ children, variant = 'pending', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variants[variant] || variants.pending} ${className}`.trim()}>
      {children}
    </span>
  );
}
