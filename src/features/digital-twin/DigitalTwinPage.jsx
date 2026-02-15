import React, { useState, useEffect } from 'react';
import PatientList from './PatientList';
import ThreeDVeinViewer from './ThreeDVeinViewer';
import VeinInjectionMap from './VeinInjectionMap';
import AddPatientModal from './AddPatientModal';
import { Activity, FileText, Plus } from 'lucide-react';
import { getPatientList, subscribeToPatients, addPatient } from '../../data/veinData';
import { maskNationalId } from '../../utils/security';

const DigitalTwinPage = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [patients, setPatients] = useState([]);

    // Subscribe to Firestore updates
    useEffect(() => {
        const unsubscribe = subscribeToPatients((updatedList) => {
            const formatted = updatedList.map(p => ({
                ...p,
                lastVisit: p.lastVisit || new Date().toISOString().split('T')[0],
                veins: (p.difficulty === 'Very Easy' || !p.difficulty) ? 'Excellent' : p.difficulty
            }));
            setPatients(formatted);

            // Auto-select first if none selected
            if (!selectedPatient && formatted.length > 0) {
                // setSelectedPatient(formatted[0]); // Optional: Don't auto-select if user hasn't chosen
            }
        });
        return () => unsubscribe && unsubscribe();
    }, []); // Empty dependency array = run on mount only

    const handleAddPatient = async (newPatientData) => {
        try {
            // This is now async and adds to Firestore
            // The subscription above will automatically update the UI 'patients' list
            const savedPatient = await addPatient(newPatientData);

            // We can select it immediately for better UX
            const formatted = {
                ...savedPatient,
                lastVisit: new Date().toISOString().split('T')[0],
                veins: 'Excellent'
            };
            setSelectedPatient(formatted);
        } catch (error) {
            console.error("Failed to add patient:", error);
            alert(`Error saving patient: ${error.message}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 h-[calc(100vh-80px)]">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Digital Twin Database</h1>
                    <p className="text-gray-500 text-sm">Real-time physiological models and history</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} /> Add Patient
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-10">
                <div className="lg:col-span-1 h-full overflow-y-auto">
                    <PatientList patients={patients} onSelect={setSelectedPatient} />
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex flex-col overflow-y-auto">
                    {selectedPatient ? (
                        <>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedPatient.name}</h2>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span>ID: {maskNationalId(selectedPatient.nationalId)}</span>
                                        <span>• {selectedPatient.gender}</span>
                                        <span>• {selectedPatient.age} yrs</span>
                                        <span className="font-bold text-red-600">• {selectedPatient.bloodType}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.location.href = `/ar?patientId=${selectedPatient.id}`}
                                        className="px-3 py-2 bg-[#00e5ff] text-black font-bold rounded-lg text-xs hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                                    >
                                        <Activity size={16} /> Open AR Scanner
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 flex-1 min-h-[400px]">
                                {/* 3D Model */}
                                <div className="bg-gray-900 m-1 rounded-lg overflow-hidden relative">
                                    <ThreeDVeinViewer veinData={selectedPatient.veinData} />
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-gray-700 text-white text-xs">
                                        <p className="text-gray-400 mb-1">VEIN PROFILE</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <span>Avg. Depth:</span> <span className="text-blue-400 font-mono">2.4mm</span>
                                            <span>Avg. Diam:</span> <span className="text-blue-400 font-mono">3.8mm</span>
                                            <span>Stability:</span> <span className="text-green-400 font-mono">High</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Injection Map */}
                                <div className="m-1 h-full">
                                    <VeinInjectionMap patientId={selectedPatient.id} />
                                </div>
                            </div>

                            {/* Medical Orders Section */}
                            <div className="px-4 pt-2">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Medical Orders</h3>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedPatient.medicalOrders && selectedPatient.medicalOrders.length > 0 ? (
                                        selectedPatient.medicalOrders.map((order) => (
                                            <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                                                <div>
                                                    <span className="font-medium text-gray-800">{order.type}</span>
                                                    <span className="text-gray-500 ml-2">by {order.doctor}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">{order.date}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-xs italic">No active orders</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-3 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                    <p className="text-xs text-gray-500">Access Difficulty</p>
                                    <p className={`text-lg font-bold ${selectedPatient.difficulty?.includes('Easy') ? 'text-green-600' :
                                        selectedPatient.difficulty?.includes('Difficult') ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        {selectedPatient.difficulty || 'Moderate'}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                    <p className="text-xs text-gray-500">Primary Condition</p>
                                    <p className="text-sm font-bold text-gray-700 mt-1">{selectedPatient.condition}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                                    <p className="text-xs text-gray-500">Success Probability</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {selectedPatient.veins === 'Excellent' ? '98%' :
                                            selectedPatient.veins === 'Good' ? '92%' : '75%'}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p>Select a patient to view Digital Twin model</p>
                        </div>
                    )}
                </div>
            </div>

            <AddPatientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddPatient}
            />
        </div>
    );
};

export default DigitalTwinPage;
