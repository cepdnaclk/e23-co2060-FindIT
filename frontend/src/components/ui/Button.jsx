const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm',
  secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
};

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm font-semibold',
  lg: 'px-5 py-3 text-base font-semibold'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
