import React from 'react';
import { CheckCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';

const ResultCard = ({ result, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Analyzing vein parameters...</p>
                <p className="text-gray-400 text-sm mt-2">Consulting clinical guidelines</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center min-h-[400px] text-center">
                <Info size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Ready to Analyze</h3>
                <p className="text-gray-500 max-w-xs mt-2">Enter patient vein metrics to receive an AI-assisted needle recommendation.</p>
            </div>
        );
    }

    const { recommendation } = result;

    // Dynamic color for confidence bar
    const confidenceColor = recommendation.confidenceLevel.color;
    const confidenceWidth = `${recommendation.successProbability}%`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">2</span>
                    AI Recommendation
                </h2>
                <span className="text-xs font-mono text-gray-400">{new Date().toLocaleTimeString()}</span>
            </div>

            <div className="flex items-start gap-4 mb-8">
                <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg transform transition-transform hover:scale-105`} style={{ backgroundColor: getGaugeColor(recommendation.gauge) }}>
                    <span className="text-3xl font-black">{recommendation.gauge}</span>
                    <span className="text-xs opacity-90 font-medium">Gauge</span>
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-700">Success Probability</span>
                        <span className="text-sm font-bold" style={{ color: confidenceColor }}>{recommendation.successProbability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
                        <div className="h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: confidenceWidth, backgroundColor: confidenceColor }}></div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Confidence: <span style={{ color: confidenceColor }}>{recommendation.confidenceLevel.level}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Needle Length</p>
                    <p className="text-lg font-bold text-gray-900">{recommendation.needleLength.inches}</p>
                    <p className="text-xs text-gray-600">{recommendation.needleLength.label}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Typical Use</p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-1">{recommendation.gaugeDetails.typicalUse}</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info size={16} className="text-blue-500" />
                        Rationale
                    </h4>
                    <ul className="space-y-2">
                        {recommendation.reasoning.map((reason, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>

                {recommendation.risks.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-orange-500" />
                            Risk Assessment
                        </h4>
                        <div className="space-y-2">
                            {recommendation.risks.map((risk, idx) => (
                                <div key={idx} className={`p-3 rounded-lg text-sm border flex gap-3 ${getRiskStyle(risk.severity)}`}>
                                    {risk.severity === 'critical' ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> : <Info size={16} className="shrink-0 mt-0.5" />}
                                    <span>{risk.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper: Map gauge string to Tailwind color class (or hex)
function getGaugeColor(gauge) {
    const map = {
        '16G': '#9ca3af', // Gray
        '18G': '#22c55e', // Green
        '20G': '#f472b6', // Pink
        '22G': '#3b82f6', // Blue
        '24G': '#eab308', // Yellow
    };
    return map[gauge] || '#6b7280';
}

function getRiskStyle(severity) {
    switch (severity) {
        case 'critical': return 'bg-red-50 text-red-700 border-red-100';
        case 'warning': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'success': return 'bg-green-50 text-green-700 border-green-100';
        default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
}

export default ResultCard;
