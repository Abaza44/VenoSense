import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { APP_NAME, APP_VERSION, APP_TAGLINE } from '../utils/constants';

const FEATURES = [
  {
    path: '/ar',
    title: 'AR Vein Scanner',
    description: 'Real-time vein visualization with camera overlay. Identify and measure veins instantly.',
    badge: 'LIVE',
    badgeVariant: 'vein',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
        <circle cx="12" cy="12" r="8" strokeDasharray="4 4" opacity="0.4" />
      </svg>
    ),
    gradient: 'from-cyan-500/10 to-teal-500/5',
  },
  {
    path: '/recommend',
    title: 'Smart Needle Recommender',
    description: 'AI-powered needle gauge selection based on vein geometry and patient factors.',
    badge: 'AI',
    badgeVariant: 'vein',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    gradient: 'from-blue-500/10 to-cyan-500/5',
  },
  {
    path: '/patients',
    title: 'Patient VeinMap',
    description: 'Cloud-based digital twin profiles. Track vein changes across visits.',
    badge: 'CLOUD',
    badgeVariant: 'vein',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
      </svg>
    ),
    gradient: 'from-emerald-500/10 to-cyan-500/5',
  },
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Scan', desc: 'Point scanner at patient arm' },
  { step: '02', title: 'Analyze', desc: 'AI identifies veins & measures' },
  { step: '03', title: 'Recommend', desc: 'Get optimal needle selection' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-10 pt-4">
        <div className="inline-flex items-center gap-2 bg-vein-400/10 border border-vein-400/20 rounded-full px-4 py-1.5 mb-4">
          <div className="w-2 h-2 bg-vein-400 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-vein-400 tracking-wider">SYSTEM ONLINE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-wider mb-3">
          <span className="text-gradient">{APP_NAME}</span>
          <span className="text-white ml-2">v{APP_VERSION}</span>
        </h1>
        <p className="text-gray-400 text-lg font-light max-w-md mx-auto">
          {APP_TAGLINE}
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {FEATURES.map((f, i) => (
          <Card
            key={f.path}
            hover
            onClick={() => navigate(f.path)}
            padding="p-6"
            className={`stagger-item bg-gradient-to-br ${f.gradient} group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-surface-700/50 group-hover:bg-vein-400/10 transition-colors">
                {f.icon}
              </div>
              <Badge variant={f.badgeVariant} size="xs">{f.badge}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
            <div className="mt-4 flex items-center gap-1 text-vein-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Open</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-10">
        <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 text-center mb-6">
          How It Works
        </h2>
        <div className="flex items-center justify-center gap-4">
          {WORKFLOW_STEPS.map((ws, i) => (
            <div key={ws.step} className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-surface-700 border border-surface-500 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-sm font-mono font-bold text-vein-400">{ws.step}</span>
                </div>
                <p className="text-sm font-semibold text-white">{ws.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-[120px]">{ws.desc}</p>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7986a0" strokeWidth="1.5" className="opacity-30 mt-[-20px]">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Device Accuracy" value="99.2%" />
        <StatCard label="Avg Response" value="<800ms" />
        <StatCard label="Patient Records" value="Cloud" />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-card rounded-lg p-4 text-center">
      <p className="text-xl font-display font-bold text-vein-400">{value}</p>
      <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
