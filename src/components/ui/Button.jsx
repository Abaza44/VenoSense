export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vein-400/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-vein-400 text-surface-900 hover:bg-vein-300 hover:shadow-vein active:scale-[0.97]',
    secondary:
      'bg-surface-600 text-white border border-surface-500 hover:border-vein-400/30 hover:bg-surface-500',
    ghost:
      'bg-transparent text-vein-400 hover:bg-vein-400/10',
    danger:
      'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner !w-4 !h-4 !border-2" />}
      {children}
    </button>
  );
}
