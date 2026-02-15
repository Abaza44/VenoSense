import React, { useState } from 'react';
import { generateRecommendation } from './RecommendationEngine';
import InputForm from './InputForm';
import ResultCard from './ResultCard';

const RecommenderPage = () => {
    const [formData, setFormData] = useState({
        veinDiameter: '',
        veinDepth: '',
        ageGroup: 'adult',
        stabilityIndex: 75,
        patientHistory: 'none'
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Simulate AI "Processing" delay for effect
        setTimeout(() => {
            const EngineInput = {
                veinDiameter: parseFloat(formData.veinDiameter),
                veinDepth: parseFloat(formData.veinDepth),
                ageGroup: formData.ageGroup,
                stabilityIndex: parseInt(formData.stabilityIndex),
                patientHistory: formData.patientHistory
            };

            const calculation = generateRecommendation(EngineInput);
            setResult(calculation);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Needle Recommender</h1>
                <p className="text-gray-500 max-w-2xl">
                    Our multi-factor scoring engine analyzes vein geometry and patient risk factors to suggest the optimal needle gauge.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <InputForm
                    values={formData}
                    handleChange={handleChange}
                    onSubmit={handleSubmit}
                />

                <div className="lg:h-full">
                    <ResultCard result={result} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default RecommenderPage;
