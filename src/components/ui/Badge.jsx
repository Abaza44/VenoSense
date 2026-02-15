export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) {
  const base = 'inline-flex items-center font-mono font-semibold rounded-full uppercase tracking-wider';

  const variants = {
    default: 'bg-surface-600 text-gray-300',
    vein: 'bg-vein-400/15 text-vein-400 border border-vein-400/30',
    success: 'bg-green-500/15 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
