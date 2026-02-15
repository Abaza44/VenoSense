import React, { useState } from 'react';
import { X, Save, User, Activity, Calendar } from 'lucide-react';

const AddPatientModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        nationalId: '',
        age: '',
        gender: 'Male',
        bloodType: 'A+',
        condition: 'Healthy'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Pass data to parent to handle async saving
        onAdd({
            name: formData.name,
            nationalId: formData.nationalId,
            age: parseInt(formData.age) || 0,
            gender: formData.gender,
            bloodType: formData.bloodType,
            condition: formData.condition
        });

        onClose();

        // Reset form
        setFormData({
            name: '',
            nationalId: '',
            age: '',
            gender: 'Female',
            bloodType: 'O+',
            condition: 'None'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Add New Patient</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Arabic/English)</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. أحمد محمد"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">National ID (14 Digits)</label>
                        <input
                            type="text"
                            required
                            minLength="14"
                            maxLength="14"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                            placeholder="e.g. 29001011234567"
                            value={formData.nationalId}
                            onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                                type="number"
                                required
                                min="0"
                                max="120"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.bloodType}
                                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.condition}
                                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                            >
                                <option value="Healthy">Healthy</option>
                                <option value="Diabetic">Diabetic</option>
                                <option value="Hypertension">Hypertension</option>
                                <option value="Oncology">Oncology</option>
                                <option value="Geriatric">Geriatric</option>
                                <option value="Pediatric">Pediatric</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        <Save size={18} />
                        Save Patient
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;
