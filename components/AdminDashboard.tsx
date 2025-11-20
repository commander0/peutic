
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, DollarSign, Activity, LogOut, Settings, UserCheck, Video, Lock, Search, Edit2, Save, Ban, Trash2, RefreshCcw, Image } from 'lucide-react';
import { Database } from '../services/database';
import { User, Companion, Transaction, GlobalSettings } from '../types';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'specialists' | 'financials' | 'settings'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(Database.getSettings());
  
  // Editing States
  const [editingCompanion, setEditingCompanion] = useState<Companion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load Data
  useEffect(() => {
    const refresh = () => {
        setUsers(Database.getAllUsers());
        setCompanions(Database.getCompanions());
        setTransactions(Database.getAllTransactions());
        setSettings(Database.getSettings());
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const handleBanUser = (user: User) => {
    if (confirm(`Are you sure you want to ${user.subscriptionStatus === 'BANNED' ? 'unban' : 'ban'} ${user.name}?`)) {
        const updated = { ...user, subscriptionStatus: user.subscriptionStatus === 'BANNED' ? 'ACTIVE' : 'BANNED' as any };
        Database.updateUser(updated);
        setUsers(Database.getAllUsers()); // Force refresh
    }
  };

  const handleAddFunds = (user: User) => {
     const amount = prompt("Enter minutes to add:", "60");
     if (amount && !isNaN(Number(amount))) {
         const updated = { ...user, balance: user.balance + Number(amount) };
         Database.updateUser(updated);
     }
  };

  const handleSaveCompanion = () => {
      if (editingCompanion) {
          Database.updateCompanion(editingCompanion);
          setEditingCompanion(null);
      }
  };

  const handleSaveSettings = () => {
      Database.saveSettings(settings);
      alert("Global settings updated successfully.");
  };

  // --- Metrics ---
  const totalRevenue = transactions.reduce((acc, tx) => acc + (tx.cost || 0), 0);
  const totalMinutes = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const revenueData = transactions.slice(0, 7).map(tx => ({
      name: new Date(tx.date).toLocaleDateString(),
      revenue: tx.cost || 0
  })).reverse();

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
             <div className="w-8 h-8 bg-peutic-yellow rounded flex items-center justify-center text-black font-bold">P</div>
             <span className="font-bold text-lg">Admin OS</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'User Management' },
                { id: 'specialists', icon: UserCheck, label: 'Specialists' },
                { id: 'financials', icon: DollarSign, label: 'Financials' },
                { id: 'settings', icon: Settings, label: 'Global Settings' },
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === item.id ? 'bg-peutic-yellow text-black' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                >
                    <item.icon className="w-5 h-5" /> {item.label}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
             <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full px-4 py-2">
                <LogOut className="w-4 h-4" /> Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">{activeTab.replace('_', ' ')}</h1>
                <p className="text-gray-500">System status: <span className="text-green-600 font-bold">OPERATIONAL</span></p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live
                 </div>
            </div>
        </header>

        {/* TABS CONTENT */}
        
        {activeTab === 'overview' && (
            <div className="space-y-8">
                {/* Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <MetricCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} color="green" />
                    <MetricCard title="Total Users" value={users.length.toString()} icon={Users} color="blue" />
                    <MetricCard title="Active Specialists" value={companions.filter(c => c.status === 'AVAILABLE').length.toString()} icon={UserCheck} color="purple" />
                    <MetricCard title="Minutes Consumed" value={totalMinutes.toString()} icon={Activity} color="yellow" />
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg mb-6">Recent Revenue Stream</h3>
                        <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#FACC15" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-black"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                 </div>
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold">{user.name}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{user.email}</td>
                                <td className="px-6 py-4 font-mono">{user.balance} mins</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.subscriptionStatus === 'BANNED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {user.subscriptionStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleAddFunds(user)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold">Add Funds</button>
                                    <button onClick={() => handleBanUser(user)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded"><Ban className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        )}

        {activeTab === 'specialists' && (
            <div className="grid grid-cols-1 gap-6">
                {/* Edit Modal */}
                {editingCompanion && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold mb-6">Edit Specialist: {editingCompanion.name}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Status</label>
                                    <select 
                                        value={editingCompanion.status}
                                        onChange={(e) => setEditingCompanion({...editingCompanion, status: e.target.value as any})}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="BUSY">Busy</option>
                                        <option value="OFFLINE">Offline</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Replica ID (Tavus)</label>
                                    <input 
                                        className="w-full border rounded-lg p-2 font-mono text-sm"
                                        value={editingCompanion.replicaId}
                                        onChange={(e) => setEditingCompanion({...editingCompanion, replicaId: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Image URL</label>
                                    <div className="flex gap-2">
                                        <input 
                                            className="w-full border rounded-lg p-2 text-sm"
                                            value={editingCompanion.imageUrl}
                                            onChange={(e) => setEditingCompanion({...editingCompanion, imageUrl: e.target.value})}
                                        />
                                        <img src={editingCompanion.imageUrl} className="w-10 h-10 rounded object-cover border" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Paste a direct image link here to update the thumbnail.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Bio</label>
                                    <textarea 
                                        className="w-full border rounded-lg p-2 text-sm h-24"
                                        value={editingCompanion.bio}
                                        onChange={(e) => setEditingCompanion({...editingCompanion, bio: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button onClick={() => setEditingCompanion(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleSaveCompanion} className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {companions.map(comp => (
                        <div key={comp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                            <div className="h-32 bg-gray-100 relative">
                                <img src={comp.imageUrl} className="w-full h-full object-cover" />
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${comp.status === 'AVAILABLE' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>{comp.status}</div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{comp.name}</h3>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{comp.specialty}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{comp.bio}</p>
                                <p className="text-xs font-mono text-gray-400 mb-4">ID: {comp.replicaId}</p>
                                <button 
                                    onClick={() => setEditingCompanion(comp)}
                                    className="w-full py-2 border border-gray-200 rounded-lg font-bold text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'financials' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg">Global Transaction Ledger</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{tx.id}</td>
                                <td className="px-6 py-4 text-sm">{new Date(tx.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold">{tx.userName || 'System'}</td>
                                <td className="px-6 py-4 text-sm">{tx.description}</td>
                                <td className="px-6 py-4 font-bold text-green-600">${(tx.cost || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'settings' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-2xl">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg">Global System Configuration</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Base Price ($ per minute)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3"
                            value={settings.pricePerMinute}
                            onChange={(e) => setSettings({...settings, pricePerMinute: parseFloat(e.target.value)})}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-bold">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500">Disable login and signups temporarily.</p>
                        </div>
                        <button 
                            onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                            className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-bold">Allow New Signups</h4>
                            <p className="text-sm text-gray-500">Toggle public registration.</p>
                        </div>
                        <button 
                            onClick={() => setSettings({...settings, allowSignups: !settings.allowSignups})}
                            className={`w-12 h-6 rounded-full relative transition-colors ${settings.allowSignups ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowSignups ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <button onClick={handleSaveSettings} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800">
                        Save System Settings
                    </button>
                </div>
             </div>
        )}

      </main>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className={`p-4 rounded-lg bg-${color}-100 text-${color}-600`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-extrabold">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
