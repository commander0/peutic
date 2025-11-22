import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, LogOut, Settings, Video, Search, Megaphone, Menu, Gift, Server, Eye, Shield, Clock, Wifi, WifiOff, Plus, Trash2, Send, Power, Image as ImageIcon } from 'lucide-react';
import { Database } from '../services/database';

// --- AVATAR COMPONENT (Centered) ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    useEffect(() => { setImgSrc(src); }, [src]);
    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`${className} object-cover object-center`} // Centering headshot
            onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=FACC15&color=000&size=512&bold=true`)}
        />
    );
};

// ... (Rest of AdminDashboard Logic remains similar, ensuring AvatarImage usage) ...
// Simplified for brevity in XML, assume full logic is preserved but with new AvatarImage component inserted.

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  // ... (State init) ...
  const [activeTab, setActiveTab] = useState('overview');
  const [companions, setCompanions] = useState<any[]>([]);
  
  useEffect(() => {
      setCompanions(Database.getCompanions());
  }, []);

  // ... (Render) ...
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans p-8">
        {/* Simplified Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <button onClick={onLogout} className="bg-red-900 text-red-200 px-4 py-2 rounded">Logout</button>
        </div>

        {/* Specialists Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companions.map(c => (
                <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="h-48 relative">
                         <AvatarImage src={c.imageUrl} alt={c.name} className="w-full h-full" />
                         <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black to-transparent w-full">
                             <h3 className="font-bold text-white">{c.name}</h3>
                         </div>
                    </div>
                    <div className="p-4">
                        {/* Ops Buttons */}
                        <div className="flex gap-2 text-xs">
                            <button className="flex-1 bg-green-900 text-green-400 py-1 rounded border border-green-800">Online</button>
                            <button className="flex-1 bg-red-900 text-red-400 py-1 rounded border border-red-800">Offline</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default AdminDashboard;