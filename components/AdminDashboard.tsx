
import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import { 
    Users, DollarSign, Activity, LogOut, Settings, Video, 
    Search, Edit2, Ban, Zap, ShieldAlert, 
    Terminal, Globe, AlertOctagon, Megaphone, Menu, X, Gift, Download, Tag
} from 'lucide-react';
import { Database } from '../services/database';
import { User, UserRole, Companion, Transaction, GlobalSettings, SystemLog, ServerMetric, PromoCode } from '../types';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'specialists' | 'financials' | 'marketing' | 'settings' | 'security'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Sidebar State

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(Database.getSettings());
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<ServerMetric[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [editingCompanion, setEditingCompanion] = useState<Companion | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newPromoCode, setNewPromoCode] = useState({ code: '', discount: 10 });

  // Simulated Real-time Refresh
  useEffect(() => {
    const refresh = () => {
        setUsers(Database.getAllUsers());
        setCompanions(Database.getCompanions());
        setTransactions(Database.getAllTransactions());
        setSettings(Database.getSettings());
        setLogs(Database.getSystemLogs());
        setMetrics(Database.getServerMetrics());
        setPromos(Database.getPromoCodes());
        setLastRefresh(new Date());
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Actions ---

  const handleRoleToggle = (user: User) => {
      const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
      if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
          Database.updateUser({ ...user, role: newRole });
          Database.logSystemEvent('WARNING', 'Role Change', `Changed ${user.email} to ${newRole}`);
      }
  };

  const handleBanUser = (user: User) => {
    if (confirm(`Are you sure you want to ${user.subscriptionStatus === 'BANNED' ? 'unban' : 'ban'} ${user.name}?`)) {
        const updated = { ...user, subscriptionStatus: user.subscriptionStatus === 'BANNED' ? 'ACTIVE' : 'BANNED' as any };
        Database.updateUser(updated);
        Database.logSystemEvent('WARNING', 'User Ban Status', `${user.email} status set to ${updated.subscriptionStatus}`);
    }
  };

  const handleAddFunds = (user: User) => {
     const amount = prompt("Enter minutes to add:", "60");
     if (amount && !isNaN(Number(amount))) {
         const updated = { ...user, balance: user.balance + Number(amount) };
         Database.updateUser(updated);
         Database.logSystemEvent('INFO', 'Admin Topup', `Added ${amount} mins to ${user.email}`);
     }
  };

  const handleCreatePromo = () => {
      if (!newPromoCode.code) return;
      Database.createPromoCode(newPromoCode.code, newPromoCode.discount);
      setNewPromoCode({ code: '', discount: 10 });
  };

  const handleDeletePromo = (id: string) => {
      if (confirm("Delete this promo code?")) {
          Database.deletePromoCode(id);
      }
  };

  const handleSaveSettings = () => {
      Database.saveSettings(settings);
      alert("System configuration saved.");
  };

  // --- Metrics Calculation ---
  const totalRevenue = transactions.reduce((acc, tx) => acc + (tx.cost || 0), 0);
  const activeUsers = users.filter(u => u.lastActive && new Date(u.lastActive).getTime() > Date.now() - 3600000).length; // Active in last hour
  const revenueData = transactions.slice(0, 10).map(tx => ({
      name: new Date(tx.date).toLocaleTimeString(),
      revenue: tx.cost || 0
  })).reverse();

  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = userFilter === 'ALL' ? true : userFilter === 'ADMIN' ? u.role === UserRole.ADMIN : u.subscriptionStatus === 'BANNED';
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900 flex overflow-hidden relative">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* COMMAND SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0A0A0A] text-gray-400 flex flex-col flex-shrink-0 shadow-2xl z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
             <div className="flex items-center">
                 <div className="w-10 h-10 bg-peutic-yellow rounded-xl flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(250,204,21,0.5)] mr-3">
                     <Zap className="w-6 h-6 fill-black" />
                 </div>
                 <div>
                    <h1 className="text-white font-bold text-lg tracking-tight">PEUTIC OS</h1>
                    <p className="text-xs text-gray-500 font-mono tracking-widest">ADMIN v2.5</p>
                 </div>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X className="w-6 h-6" /></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
            <div className="px-4 pb-2 text-xs font-bold text-gray-600 uppercase tracking-widest">Main Module</div>
            {[
                { id: 'overview', icon: Activity, label: 'Mission Control' },
                { id: 'users', icon: Users, label: 'User Database' },
                { id: 'specialists', icon: Video, label: 'Specialist Grid' },
                { id: 'financials', icon: DollarSign, label: 'Revenue Stream' },
                { id: 'marketing', icon: Gift, label: 'Marketing & Promos' },
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === item.id ? 'bg-peutic-yellow text-black shadow-lg transform scale-105' : 'hover:bg-gray-900 hover:text-white'}`}
                >
                    <item.icon className="w-5 h-5" /> {item.label}
                </button>
            ))}

            <div className="mt-8 px-4 pb-2 text-xs font-bold text-gray-600 uppercase tracking-widest">System Module</div>
            {[
                { id: 'settings', icon: Settings, label: 'Global Config' },
                { id: 'security', icon: ShieldAlert, label: 'Security & Logs' },
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === item.id ? 'bg-peutic-yellow text-black shadow-lg transform scale-105' : 'hover:bg-gray-900 hover:text-white'}`}
                >
                    <item.icon className="w-5 h-5" /> {item.label}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full absolute inset-0 animate-ping opacity-75"></div>
                </div>
                <span className="text-xs font-mono text-green-500">SYSTEM ONLINE</span>
             </div>
             <button onClick={onLogout} className="flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/20 w-full px-4 py-3 rounded-lg transition-colors border border-red-900/30">
                <LogOut className="w-4 h-4" /> Terminate Session
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen relative w-full">
        {/* Dynamic Header */}
        <header className="sticky top-0 z-30 bg-[#FFFBEB]/90 backdrop-blur-md border-b border-yellow-100 px-4 md:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-white border border-yellow-200 rounded-lg">
                    <Menu className="w-6 h-6 text-black" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 uppercase">{activeTab.replace('_', ' ')}</h2>
                    <p className="text-gray-500 text-xs md:text-sm font-medium flex items-center gap-2 hidden md:flex">
                        Last updated: <span className="font-mono">{lastRefresh.toLocaleTimeString()}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <button onClick={() => Database.setAllCompanionsStatus('AVAILABLE')} className="hidden md:flex bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 items-center gap-2 shadow-lg">
                    <Zap className="w-3 h-3 text-peutic-yellow" /> FORCE ALL AVAILABLE
                 </button>
                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-black">
                    <img src={`https://ui-avatars.com/api/?name=Admin&background=000&color=fff`} alt="Admin" />
                 </div>
            </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 pb-20">
            
            {/* --- TAB: MISSION CONTROL --- */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} trend="+12.5%" color="green" />
                        <KPICard title="Total Users" value={users.length.toString()} icon={Users} trend="+5 this hour" color="blue" />
                        <KPICard title="Active Sessions" value={metrics[0]?.activeSessions.toString() || "0"} icon={Activity} trend="High Load" color="purple" />
                        <KPICard title="Server Latency" value={`${metrics[0]?.latency.toFixed(0)}ms`} icon={Zap} trend="Optimal" color="yellow" />
                    </div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Revenue Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-yellow-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Real-time Revenue</h3>
                                <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm">
                                    <option>Last Hour</option>
                                    <option>Last 24h</option>
                                </select>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" hide />
                                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                                        <Area type="monotone" dataKey="revenue" stroke="#CA8A04" fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100">
                            <h3 className="font-bold text-lg mb-6">Server Health</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500 font-bold">CPU Load</span>
                                        <span className="font-mono font-bold">{metrics[0]?.cpu.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-black h-2 rounded-full transition-all duration-500" style={{width: `${metrics[0]?.cpu}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500 font-bold">Memory Usage</span>
                                        <span className="font-mono font-bold">{metrics[0]?.memory.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{width: `${metrics[0]?.memory}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500 font-bold">API Quota (Tavus)</span>
                                        <span className="font-mono font-bold">45% Used</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{width: `45%`}}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3">
                                <AlertOctagon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-yellow-800 mb-1">SYSTEM NOTICE</p>
                                    <p className="text-xs text-yellow-700 leading-relaxed">High traffic volume detected in region US-East. Auto-scaling enabled.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: USERS --- */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
                     <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name, email or ID..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select 
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                            >
                                <option value="ALL">All Users</option>
                                <option value="ADMIN">Admins</option>
                                <option value="BANNED">Banned</option>
                            </select>
                            <button onClick={() => Database.exportData('USERS')} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Export
                            </button>
                        </div>
                     </div>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User Profile</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Balance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-yellow-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
                                                <div>
                                                    <p className="font-bold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleRoleToggle(user)}
                                                className={`px-2 py-1 rounded text-xs font-bold border ${user.role === UserRole.ADMIN ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                            >
                                                {user.role}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-peutic-yellow bg-black/5 rounded px-2 inline-block my-3">
                                            {user.balance}m
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${user.subscriptionStatus === 'BANNED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.subscriptionStatus === 'BANNED' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                {user.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(user.joinedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleAddFunds(user)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg border border-transparent hover:border-green-200" title="Add Funds">
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleBanUser(user)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-200" title="Ban/Unban">
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                </div>
            )}

             {/* --- TAB: SPECIALISTS --- */}
             {activeTab === 'specialists' && (
                <div>
                    {/* Edit Modal */}
                    {editingCompanion && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-8 rounded-3xl w-full max-w-xl shadow-2xl border border-yellow-100 animate-float" style={{animation: 'none'}}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold">Edit Profile</h3>
                                    <button onClick={() => setEditingCompanion(null)} className="p-2 hover:bg-gray-100 rounded-full"><LogOut className="w-5 h-5" /></button>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                                            <input className="w-full border rounded-xl p-3 font-bold" value={editingCompanion.name} onChange={e => setEditingCompanion({...editingCompanion, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                                            <select 
                                                value={editingCompanion.status}
                                                onChange={(e) => setEditingCompanion({...editingCompanion, status: e.target.value as any})}
                                                className="w-full border rounded-xl p-3"
                                            >
                                                <option value="AVAILABLE">🟢 Available</option>
                                                <option value="BUSY">🔴 Busy</option>
                                                <option value="OFFLINE">⚪ Offline</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tavus Replica ID</label>
                                        <div className="relative">
                                            <Terminal className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input className="w-full border rounded-xl pl-10 p-3 font-mono text-sm bg-gray-50" value={editingCompanion.replicaId} onChange={e => setEditingCompanion({...editingCompanion, replicaId: e.target.value})} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Thumbnail URL</label>
                                        <div className="flex gap-3">
                                            <input className="w-full border rounded-xl p-3 text-sm" value={editingCompanion.imageUrl} onChange={e => setEditingCompanion({...editingCompanion, imageUrl: e.target.value})} />
                                            <img src={editingCompanion.imageUrl} className="w-12 h-12 rounded-lg object-cover border" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bio</label>
                                        <textarea className="w-full border rounded-xl p-3 text-sm h-24" value={editingCompanion.bio} onChange={e => setEditingCompanion({...editingCompanion, bio: e.target.value})} />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button onClick={() => setEditingCompanion(null)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                                    <button onClick={() => { Database.updateCompanion(editingCompanion); setEditingCompanion(null); }} className="px-6 py-3 bg-peutic-yellow text-black font-bold rounded-xl hover:bg-yellow-400 shadow-lg">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {companions.map(comp => (
                            <div key={comp.id} className="bg-white rounded-2xl border border-yellow-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                <div className="relative h-48">
                                    <img src={comp.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md text-white ${comp.status === 'AVAILABLE' ? 'bg-green-500/80' : 'bg-gray-500/80'}`}>
                                        {comp.status}
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="font-bold text-xl">{comp.name}</h3>
                                        <p className="text-xs text-gray-300">{comp.specialty}</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                                        <span>ID: {comp.replicaId.substring(0, 6)}...</span>
                                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> HD</span>
                                    </div>
                                    <button 
                                        onClick={() => setEditingCompanion(comp)}
                                        className="w-full py-3 bg-gray-50 hover:bg-black hover:text-white border border-gray-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" /> Manage Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB: MARKETING (New) --- */}
            {activeTab === 'marketing' && (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-yellow-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Gift className="w-5 h-5" /> Promo Code Generator</h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Code Name</label>
                                <input 
                                    className="w-full border rounded-xl p-3 font-bold uppercase" 
                                    placeholder="WELCOME2025"
                                    value={newPromoCode.code}
                                    onChange={e => setNewPromoCode({...newPromoCode, code: e.target.value})}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount (%)</label>
                                <input 
                                    type="number"
                                    className="w-full border rounded-xl p-3 font-bold" 
                                    value={newPromoCode.discount}
                                    onChange={e => setNewPromoCode({...newPromoCode, discount: Number(e.target.value)})}
                                />
                            </div>
                            <button onClick={handleCreatePromo} className="w-full md:w-auto px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 whitespace-nowrap">
                                Create Code
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold">Active Campaigns</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Discount</th>
                                        <th className="px-6 py-4">Usage Count</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {promos.map(promo => (
                                        <tr key={promo.id} className="hover:bg-yellow-50/30">
                                            <td className="px-6 py-4 font-bold font-mono">{promo.code}</td>
                                            <td className="px-6 py-4 text-green-600 font-bold">{promo.discountPercentage}% OFF</td>
                                            <td className="px-6 py-4">{promo.uses} redeemed</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">ACTIVE</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeletePromo(promo.id)} className="text-red-500 hover:text-red-700">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {promos.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No active promo codes. Create one above.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: SETTINGS --- */}
            {activeTab === 'settings' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-yellow-100 shadow-sm">
                         <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Globe className="w-5 h-5" /> Global Configuration</h3>
                         
                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block font-bold text-sm">Pricing Model ($/min)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 border rounded-xl font-mono font-bold text-lg"
                                        value={settings.pricePerMinute}
                                        onChange={(e) => setSettings({...settings, pricePerMinute: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                             <div className="space-y-4">
                                <label className="block font-bold text-sm">Site Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border rounded-xl font-bold"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                                />
                            </div>
                         </div>

                         <div className="mt-8 pt-8 border-t border-gray-100">
                            <label className="block font-bold text-sm mb-2">Broadcast Message (Dashboard Alert)</label>
                            <div className="flex gap-2">
                                <Megaphone className="w-5 h-5 text-gray-400 mt-3" />
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border rounded-xl"
                                    value={settings.broadcastMessage || ''}
                                    onChange={(e) => setSettings({...settings, broadcastMessage: e.target.value})}
                                />
                            </div>
                         </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                         {/* Data Export Module */}
                        <div className="bg-white p-6 rounded-2xl border border-yellow-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold">Data Export</h4>
                                    <p className="text-sm text-gray-500 mt-1">Download system JSON dumps.</p>
                                </div>
                                <Download className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => Database.exportData('USERS')} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold">Users.json</button>
                                <button onClick={() => Database.exportData('LOGS')} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold">Logs.json</button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-yellow-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold">Maintenance Mode</h4>
                                <p className="text-sm text-gray-500 mt-1">Lock site for non-admins.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                                className={`w-14 h-8 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSaveSettings} className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-xl hover:bg-gray-900 transition-transform active:scale-95">
                        Save Configuration
                    </button>
                </div>
            )}

            {/* --- TAB: SECURITY & LOGS --- */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="bg-black text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-peutic-yellow opacity-10 blur-3xl rounded-full"></div>
                        <h3 className="font-bold text-2xl mb-6 flex items-center gap-2"><Terminal className="w-6 h-6 text-peutic-yellow" /> System Event Log</h3>
                        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 font-mono text-xs h-96 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-800 text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Level</th>
                                        <th className="px-4 py-3">Event</th>
                                        <th className="px-4 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-800/50">
                                            <td className="px-4 py-2 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    log.type === 'ERROR' ? 'bg-red-900 text-red-300' : 
                                                    log.type === 'WARNING' ? 'bg-yellow-900 text-yellow-300' : 
                                                    log.type === 'SUCCESS' ? 'bg-green-900 text-green-300' : 
                                                    'bg-blue-900 text-blue-300'
                                                }`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 font-bold text-gray-300">{log.event}</td>
                                            <td className="px-4 py-2 text-gray-400">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </main>
    </div>
  );
};

// Helper Component for Cards
const KPICard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black tracking-tight text-gray-900">{value}</h3>
            <p className={`text-xs font-bold mt-2 ${color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-gray-400'}`}>
                {trend}
            </p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default AdminDashboard;
