export default function Input({
  label,
  id,
  name,
  error = '',
  className = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-300">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        name={name}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition ${error ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-indigo-500'} ${className}`.trim()}
        {...props}
      />

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
