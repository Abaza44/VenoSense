import React from 'react';
import { Users, Activity, Droplet, ArrowRight, Watch, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Hero / Welcome */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">VeinoTronic Dashboard 2.0</h1>
                    <p className="text-blue-100 max-w-2xl text-lg">
                        Advanced IV decision support system now integrated with VeinoWatch™ data and AI-driven needle recommendations.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
                    <Activity size={400} />
                </div>
            </div>

            {/* Feature Launchpad */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* AR Scanner Card */}
                    <div
                        onClick={() => navigate('/ar')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-[#00e5ff] mb-4 group-hover:scale-110 transition-transform">
                            <Watch size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">AR Watch Scanner</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Visualize vein paths using real-time data streaming from VeinoWatch.
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                            Launch AR <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Needle Recommender Card */}
                    <div
                        onClick={() => navigate('/recommend')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <Droplet size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Needle AI Advisor</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Get AI-powered needle gauge recommendations based on patient metrics.
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                            Start Analysis <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Digital Twin Card */}
                    <div
                        onClick={() => navigate('/patients')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Digital Twin Database</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Access patient history and 3D physiological models.
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                            View Patients <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity (Existing Placeholder Logic) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent System Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-0 border-gray-50">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <p className="text-sm text-gray-600 flex-1">
                                <span className="font-bold text-gray-900">Dr. Sarah</span> performed a vein scan on Patient #{8390 + i}
                            </p>
                            <span className="text-xs text-gray-400">2 min ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
