import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { AGE_GROUPS, PATIENT_HISTORY_OPTIONS, INPUT_RANGES } from '../../utils/constants';

export default function InputForm({ onSubmit, loading, prefillData }) {
  const [form, setForm] = useState({
    veinDepth: '',
    veinDiameter: '',
    ageGroup: 'adult',
    stabilityIndex: '75',
    patientHistory: 'none',
  });

  // Pre-fill from AR scan data
  useEffect(() => {
    if (prefillData) {
      setForm((prev) => ({
        ...prev,
        veinDepth: prefillData.depth?.toString() || prev.veinDepth,
        veinDiameter: prefillData.diameter?.toString() || prev.veinDiameter,
        stabilityIndex: prefillData.stability?.toString() || prev.stabilityIndex,
      }));
    }
  }, [prefillData]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputClass =
    'w-full bg-surface-700 border border-surface-500 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-vein-400/50 focus:ring-1 focus:ring-vein-400/30 transition-colors';
  const labelClass = 'block text-xs text-gray-400 font-mono uppercase tracking-wider mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Row 1: Depth + Diameter */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Vein Depth ({INPUT_RANGES.veinDepth.unit})
          </label>
          <input
            type="number"
            value={form.veinDepth}
            onChange={handleChange('veinDepth')}
            min={INPUT_RANGES.veinDepth.min}
            max={INPUT_RANGES.veinDepth.max}
            step={INPUT_RANGES.veinDepth.step}
            placeholder="e.g. 3.2"
            className={inputClass}
            required
          />
          <span className="text-xs text-gray-500 mt-1 block">
            {INPUT_RANGES.veinDepth.min}–{INPUT_RANGES.veinDepth.max}mm
          </span>
        </div>
        <div>
          <label className={labelClass}>
            Vein Diameter ({INPUT_RANGES.veinDiameter.unit})
          </label>
          <input
            type="number"
            value={form.veinDiameter}
            onChange={handleChange('veinDiameter')}
            min={INPUT_RANGES.veinDiameter.min}
            max={INPUT_RANGES.veinDiameter.max}
            step={INPUT_RANGES.veinDiameter.step}
            placeholder="e.g. 2.8"
            className={inputClass}
            required
          />
          <span className="text-xs text-gray-500 mt-1 block">
            {INPUT_RANGES.veinDiameter.min}–{INPUT_RANGES.veinDiameter.max}mm
          </span>
        </div>
      </div>

      {/* Row 2: Age Group */}
      <div>
        <label className={labelClass}>Age Group</label>
        <div className="grid grid-cols-3 gap-2">
          {AGE_GROUPS.map((ag) => (
            <button
              key={ag.value}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, ageGroup: ag.value }))}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all
                ${form.ageGroup === ag.value
                  ? 'bg-vein-400/15 border-vein-400/40 text-vein-400'
                  : 'bg-surface-700 border-surface-500 text-gray-400 hover:border-surface-400'
                }`}
            >
              <span className="mr-1.5">{ag.icon}</span>
              {ag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Stability */}
      <div>
        <label className={labelClass}>
          Stability Index ({form.stabilityIndex}/100)
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={form.stabilityIndex}
          onChange={handleChange('stabilityIndex')}
          className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-vein-400"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Unstable</span>
          <span className="font-mono text-vein-400">{form.stabilityIndex}</span>
          <span>Stable</span>
        </div>
      </div>

      {/* Row 4: Patient History */}
      <div>
        <label className={labelClass}>Patient History</label>
        <select
          value={form.patientHistory}
          onChange={handleChange('patientHistory')}
          className={`${inputClass} appearance-none cursor-pointer`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%237986a0' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          {PATIENT_HISTORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {loading ? 'Analyzing...' : '⚡ Generate Recommendation'}
      </Button>
    </form>
  );
}
