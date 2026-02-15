import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate, relativeTime } from '../../utils/formatters';

export default function PatientList({ patients, loading, onSelect, selectedId }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-surface-600 rounded w-1/3 mb-2" />
            <div className="h-3 bg-surface-600 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <Card padding="p-8" className="text-center">
        <p className="text-gray-400">No patients found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {patients.map((p, i) => (
        <Card
          key={p.id}
          hover
          onClick={() => onSelect(p.id)}
          padding="p-4"
          className={`stagger-item ${selectedId === p.id ? 'glow-border' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar circle */}
              <div className="w-10 h-10 rounded-full bg-surface-600 flex items-center justify-center text-sm font-bold text-vein-400 shrink-0">
                {p.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{p.name}</span>
                  <span className="text-xs text-gray-500 font-mono">{p.id}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">Age {p.age}</span>
                  <span className="text-xs text-gray-500">{p.bloodType}</span>
                  {p.history && p.history !== 'none' && (
                    <Badge variant="warning" size="xs">{p.history}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Chevron */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7986a0" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Card>
      ))}
    </div>
  );
}
