import React from 'react';
import { User, ChevronRight, Activity, Calendar } from 'lucide-react';
import { getPatientList } from '../../data/veinData';
import { maskNationalId } from '../../utils/security';

const PatientList = ({ patients, onSelect }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Recent Patients</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {patients.map((patient) => (
                    <button
                        key={patient.id}
                        onClick={() => onSelect(patient)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                <p className="text-xs text-gray-500">ID: {maskNationalId(patient.nationalId)} • {patient.age} yrs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${patient.condition === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {patient.condition}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                                    <Calendar size={10} /> {patient.lastVisit}
                                </p>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PatientList;
