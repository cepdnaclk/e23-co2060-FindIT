export default function Card({ children, className = '', hoverable = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20 ${hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-xl' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
