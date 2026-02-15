import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import VeinDiagram from './VeinDiagram';
import { capitalize } from '../../utils/formatters';

export default function PatientProfile({ patient, latestScan }) {
  const navigate = useNavigate();

  if (!patient) return null;

  const latestVeins = latestScan?.veins || [];

  return (
    <Card padding="p-5">
      {/* Patient header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-surface-600 flex items-center justify-center text-xl font-bold text-vein-400">
            {patient.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{patient.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-400 font-mono">{patient.id}</span>
              <Badge variant="default" size="xs">{patient.bloodType}</Badge>
              <Badge variant="default" size="xs">Age {patient.age}</Badge>
              {patient.history && patient.history !== 'none' && (
                <Badge variant="warning" size="xs">{capitalize(patient.history)}</Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/ar')}
        >
          Open AR Scanner →
        </Button>
      </div>

      {/* Stats + Vein diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stats */}
        <div className="space-y-3">
          <StatRow label="Age Group" value={capitalize(patient.ageGroup || 'adult')} />
          <StatRow label="Blood Type" value={patient.bloodType} />
          <StatRow label="Medical History" value={capitalize(patient.history || 'None')} />
          {latestScan && (
            <>
              <StatRow label="Last Scan" value={latestScan.date} />
              <StatRow label="Last Arm" value={capitalize(latestScan.arm || '—')} />
              {latestScan.recommendation && (
                <>
                  <StatRow
                    label="Last Gauge"
                    value={latestScan.recommendation.gauge}
                    highlight
                  />
                  <StatRow
                    label="Last Success"
                    value={`${latestScan.recommendation.success}%`}
                    highlight
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Vein diagram */}
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
            Vein Map (Latest)
          </p>
          <VeinDiagram veins={latestVeins} />
        </div>
      </div>
    </Card>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-700/50">
      <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-vein-400 font-mono font-bold' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
