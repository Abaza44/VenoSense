import React, { useState } from 'react';
import { Menu, Home, Users, Settings, Activity, Bell, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'
                    } flex flex-col fixed h-full z-10`}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-100 cursor-pointer" onClick={() => navigate('/')}>
                    {sidebarOpen ? (
                        <span className="text-xl font-bold text-blue-600">VeinoTronic</span>
                    ) : (
                        <span className="text-xl font-bold text-blue-600">VT</span>
                    )}
                </div>

                <nav className="flex-1 py-6">
                    <ul className="space-y-1 px-3">
                        <SidebarItem
                            icon={<Home size={20} />}
                            text="Dashboard"
                            onClick={() => navigate('/')}
                            active={currentPath === '/'}
                            expanded={sidebarOpen}
                        />
                        <SidebarItem
                            icon={<Activity size={20} />}
                            text="AR Vein Scanner"
                            onClick={() => navigate('/ar')}
                            active={currentPath === '/ar'}
                            expanded={sidebarOpen}
                        />
                        <SidebarItem
                            icon={<Settings size={20} />}
                            text="Needle Recommender"
                            onClick={() => navigate('/recommend')}
                            active={currentPath === '/recommend'}
                            expanded={sidebarOpen}
                        />
                        <SidebarItem
                            icon={<Users size={20} />}
                            text="Patients (Digital Twin)"
                            onClick={() => navigate('/patients')}
                            active={currentPath === '/patients'}
                            expanded={sidebarOpen}
                        />
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            JD
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                                <p className="text-xs text-gray-500 truncate">Nurse Practitioner</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'
                }`}>
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-6 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, text, onClick, active = false, expanded = true }) => {
    return (
        <li>
            <button
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                {icon}
                {expanded && <span className="text-sm font-medium">{text}</span>}
            </button>
        </li>
    );
};

export default DashboardLayout;
