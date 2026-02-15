import React from 'react';
import { Info } from 'lucide-react';

const InputForm = ({ values, handleChange, onSubmit }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">1</span>
                Patient Parameters
            </h2>

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vein Diameter</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="veinDiameter"
                                value={values.veinDiameter}
                                onChange={handleChange}
                                step="0.1"
                                min="0.5"
                                max="8.0"
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                placeholder="2.5"
                                required
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">mm</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Range: 0.5 - 8.0 mm</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vein Depth</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="veinDepth"
                                value={values.veinDepth}
                                onChange={handleChange}
                                step="0.1"
                                min="0.5"
                                max="15.0"
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                placeholder="3.0"
                                required
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">mm</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Range: 0.5 - 15.0 mm</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['pediatric', 'adult', 'geriatric'].map((age) => (
                            <button
                                key={age}
                                type="button"
                                onClick={() => handleChange({ target: { name: 'ageGroup', value: age } })}
                                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${values.ageGroup === age
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {age}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Stability Index</label>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${values.stabilityIndex > 70 ? 'bg-green-100 text-green-700' :
                                values.stabilityIndex > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {values.stabilityIndex}/100
                        </span>
                    </div>
                    <input
                        type="range"
                        name="stabilityIndex"
                        value={values.stabilityIndex}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Rolling/Mobile</span>
                        <span>Anchored/Stable</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient History</label>
                    <select
                        name="patientHistory"
                        value={values.patientHistory}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                    >
                        <option value="none">None / Healthy</option>
                        <option value="chemotherapy">Chemotherapy</option>
                        <option value="dehydration">Dehydration</option>
                        <option value="diabetes">Diabetes</option>
                        <option value="obesity">Obesity</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-lg transform active:scale-[0.98]"
                    >
                        Generate AI Recommendation
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputForm;
