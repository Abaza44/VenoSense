export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'p-5',
  onClick,
}) {
  const base = 'glass-card rounded-xl transition-all duration-300';
  const hoverClass = hover ? 'hover-lift cursor-pointer' : '';
  const glowClass = glow ? 'glow-border' : '';
  const clickable = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${base} ${hoverClass} ${glowClass} ${clickable} ${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}
