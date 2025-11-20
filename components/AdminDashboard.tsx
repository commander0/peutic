
import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, Line, ComposedChart, Legend
} from 'recharts';
import { 
    Users, DollarSign, Activity, LogOut, Settings, Video, 
    Search, Edit2, Ban, Zap, ShieldAlert, 
    Terminal, Globe, AlertOctagon, Megaphone, Menu, X, Gift, Download, Tag,
    Clock, Wifi, Server, Cpu, HardDrive, Eye, Heart, Lock, CheckCircle, AlertTriangle
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
  
  // Session Metrics State
  const [sessionStats, setSessionStats] = useState({
      avgDuration: '18m 30s',
      totalMinutesToday: 1420,
      peakConcurrency: 42,
      bandwidthUsage: '1.2 GB/s'
  });

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [editingCompanion, setEditingCompanion] = useState<Companion | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newPromoCode, setNewPromoCode] = useState({ code: '', discount: 10 });
  
  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState(0);

  // Simulated Real-time Refresh
  useEffect(() => {
    const refresh = () => {
        setUsers(Database.getAllUsers());
        setCompanions(Database.getCompanions());
        setTransactions(Database.getAllTransactions());
        setSettings(Database.getSettings());
        setLogs(Database.getSystemLogs());
        
        const currentMetrics = Database.getServerMetrics();
        setMetrics(currentMetrics);
        
        // Simulate Session Stats Fluctuation
        setSessionStats(prev => ({
            avgDuration: `${15 + Math.floor(Math.random() * 5)}m ${10 + Math.floor(Math.random() * 50)}s`,
            totalMinutesToday: prev.totalMinutesToday + Math.floor(Math.random() * 10),
            peakConcurrency: Math.max(prev.peakConcurrency, currentMetrics[0]?.activeSessions || 0),
            bandwidthUsage: `${(0.8 + Math.random() * 0.5).toFixed(2)} GB/s`
        }));

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

  const handleAddFunds = () => {
      if (selectedUser && fundAmount > 0) {
          Database.topUpWallet(fundAmount, 0); // Admin add (0 cost)
          // Need to manually create tx for specific user since Database.topUpWallet uses session user
          // Overriding for admin tools:
          const u = selectedUser;
          u.balance += fundAmount;
          Database.updateUser(u);
          Database.addTransaction({
              id: `adm_tx_${Date.now()}`,
              userId: u.id,
              userName: u.name,
              date: new Date().toISOString(),
              amount: fundAmount,
              cost: 0,
              description: 'Admin Grant',
              status: 'COMPLETED'
          });
          setShowUserModal(false);
          setFundAmount(0);
          setSelectedUser(null);
      }
  };

  const handleStatusChange = (id: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
      const comp = companions.find(c => c.id === id);
      if (comp) {
          const updated = { ...comp, status };
          Database.updateCompanion(updated);
      }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingCompanion) {
          Database.updateCompanion(editingCompanion);
          setEditingCompanion(null);
          Database.logSystemEvent('INFO', 'Specialist Update', `Updated profile for ${editingCompanion.name}`);
      }
  };

  const handleBroadcast = () => {
      const msg = prompt("Enter new global broadcast message:", settings.broadcastMessage);
      if (msg !== null) {
          Database.saveSettings({ ...settings, broadcastMessage: msg });
      }
  };

  const toggleSetting = (key: keyof GlobalSettings) => {
      const newVal = !settings[key];
      Database.saveSettings({ ...settings, [key]: newVal });
  };

  const handleCreatePromo = () => {
      if (newPromoCode.code) {
          Database.createPromoCode(newPromoCode.code, newPromoCode.discount);
          setNewPromoCode({ code: '', discount: 10 });
      }
  };

  const handleDeletePromo = (id: string) => {
      Database.deletePromoCode(id);
  };

  const openFundModal = (u: User) => {
      setSelectedUser(u);
      setFundAmount(10);
      setShowUserModal(true);
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (userFilter === 'ADMIN') return matchesSearch && u.role === UserRole.ADMIN;
      if (userFilter === 'BANNED') return matchesSearch && u.subscriptionStatus === 'BANNED';
      return matchesSearch;
  });

  // --- RENDER COMPONENTS ---

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start">
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                  <h3 className="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">{value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
              </div>
          </div>
          {trend && <p className="text-xs font-bold text-green-600 mt-3 flex items-center gap-1">
               <Activity className="w-3 h-3" /> {trend} from last hour
          </p>}
      </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex font-sans overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black text-white flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-peutic-yellow rounded flex items-center justify-center"><Heart className="w-4 h-4 text-black fill-black"/></div>
             <span className="font-bold">Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="w-6 h-6" /></button>
      </div>

      {/* SIDEBAR */}
      <div className={`
          fixed md:static inset-y-0 left-0 w-72 bg-[#050505] text-white z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
      `}>
          <div className="p-8 flex items-center gap-3 border-b border-gray-800">
              <div className="w-10 h-10 bg-peutic-yellow rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                  <Heart className="w-6 h-6 text-black fill-black" />
              </div>
              <div>
                  <h1 className="text-xl font-black tracking-tight">PEUTIC</h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Mission Control</p>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4">
              {[
                  { id: 'overview', icon: Activity, label: 'Mission Control' },
                  { id: 'users', icon: Users, label: 'User Management' },
                  { id: 'specialists', icon: Video, label: 'Specialists & AI' },
                  { id: 'financials', icon: DollarSign, label: 'Financials' },
                  { id: 'marketing', icon: Megaphone, label: 'Marketing' },
                  { id: 'security', icon: ShieldAlert, label: 'Security Logs' },
                  { id: 'settings', icon: Settings, label: 'Global Settings' }
              ].map((item) => (
                  <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${activeTab === item.id ? 'bg-peutic-yellow text-black shadow-lg shadow-yellow-900/20' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                  >
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-black' : 'text-gray-500 group-hover:text-white'}`} />
                      {item.label}
                  </button>
              ))}
          </div>

          <div className="p-4 border-t border-gray-800">
              <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400">SERVER LOAD</span>
                      <span className="text-xs font-bold text-green-500">{metrics[0]?.cpu.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${metrics[0]?.cpu}%` }}></div>
                  </div>
              </div>
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all text-sm font-bold text-gray-500">
                  <LogOut className="w-4 h-4" /> Sign Out
              </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
          
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      System Operational • Last update: {lastRefresh.toLocaleTimeString()}
                  </p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                     <Clock className="w-4 h-4 text-gray-400" />
                     <span className="text-xs font-mono font-bold">{new Date().toLocaleTimeString()} UTC</span>
                 </div>
              </div>
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-6">
              
              {activeTab === 'overview' && (
                  <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <StatCard title="Total Revenue" value={`$${transactions.reduce((a,b) => a + (b.cost||0), 0).toFixed(2)}`} icon={DollarSign} color="bg-green-500" trend="+12.5%" />
                          <StatCard title="Active Users" value={users.length} icon={Users} color="bg-blue-500" trend="+5 New" />
                          <StatCard title="Active Sessions" value={metrics[0]?.activeSessions || 0} icon={Video} color="bg-purple-500" trend="High Load" />
                          <StatCard title="System Health" value="98.2%" icon={Activity} color="bg-emerald-500" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Live Traffic Chart */}
                          <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm">
                              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                  <Globe className="w-5 h-5 text-gray-500" /> Real-Time Traffic & Load
                              </h3>
                              <div className="h-[300px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={metrics}>
                                          <defs>
                                              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.8}/>
                                                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                                          <YAxis stroke="#9CA3AF" fontSize={10} />
                                          <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' }} />
                                          <Area type="monotone" dataKey="cpu" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" />
                                          <Line type="monotone" dataKey="activeSessions" stroke="#000" strokeWidth={2} dot={false} />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>

                          {/* Session Analytics */}
                          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                              <div>
                                  <h3 className="font-bold text-gray-900 mb-6">Live Session Metrics</h3>
                                  <div className="space-y-6">
                                      <div>
                                          <div className="flex justify-between text-sm mb-1">
                                              <span className="text-gray-500 font-bold">Avg Duration</span>
                                              <span className="font-bold">{sessionStats.avgDuration}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full w-[70%]"></div></div>
                                      </div>
                                      <div>
                                          <div className="flex justify-between text-sm mb-1">
                                              <span className="text-gray-500 font-bold">Peak Concurrency</span>
                                              <span className="font-bold">{sessionStats.peakConcurrency} / {settings.maxConcurrentSessions}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-purple-500 h-2 rounded-full" style={{width: `${(sessionStats.peakConcurrency/settings.maxConcurrentSessions)*100}%`}}></div></div>
                                      </div>
                                      <div>
                                          <div className="flex justify-between text-sm mb-1">
                                              <span className="text-gray-500 font-bold">Bandwidth</span>
                                              <span className="font-bold">{sessionStats.bandwidthUsage}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full w-[40%]"></div></div>
                                      </div>
                                  </div>
                              </div>
                              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                  <p className="text-xs font-bold text-yellow-700 uppercase mb-1">System Notice</p>
                                  <p className="text-sm text-gray-600">Queue system active. Avg wait time is stable at 1.5 min.</p>
                              </div>
                          </div>
                      </div>
                  </>
              )}

              {activeTab === 'users' && (
                  <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative w-full md:w-96">
                              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                              <input 
                                  type="text" 
                                  placeholder="Search users by name, email or ID..." 
                                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow outline-none shadow-sm"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                          <div className="flex gap-2">
                              {['ALL', 'ADMIN', 'BANNED'].map(f => (
                                  <button 
                                      key={f}
                                      onClick={() => setUserFilter(f)}
                                      className={`px-4 py-2 rounded-lg text-xs font-bold border ${userFilter === f ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
                                  >
                                      {f}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                  <tr>
                                      <th className="px-6 py-4">User</th>
                                      <th className="px-6 py-4">Role</th>
                                      <th className="px-6 py-4">Balance</th>
                                      <th className="px-6 py-4">Status</th>
                                      <th className="px-6 py-4 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {filteredUsers.map(u => (
                                      <tr key={u.id} className="hover:bg-yellow-50/50 transition-colors">
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <img src={u.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                                                  <div>
                                                      <p className="font-bold text-gray-900">{u.name}</p>
                                                      <p className="text-xs text-gray-500">{u.email}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                  {u.role}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 font-mono font-bold text-gray-900">{u.balance}m</td>
                                          <td className="px-6 py-4">
                                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${u.subscriptionStatus === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                  {u.subscriptionStatus === 'BANNED' ? <Ban className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                                                  {u.subscriptionStatus}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                              <button onClick={() => openFundModal(u)} className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition" title="Add Funds"><Gift className="w-4 h-4" /></button>
                                              <button onClick={() => handleRoleToggle(u)} className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition" title="Toggle Role"><ShieldAlert className="w-4 h-4" /></button>
                                              <button onClick={() => handleBanUser(u)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition" title="Ban/Unban"><Ban className="w-4 h-4" /></button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab === 'specialists' && (
                  <>
                     <div className="flex justify-end mb-4">
                         <button 
                            onClick={() => Database.setAllCompanionsStatus('AVAILABLE')}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all"
                         >
                             <Zap className="w-4 h-4 fill-current" /> FORCE ALL AVAILABLE (LAUNCH MODE)
                         </button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companions.map(c => (
                            <div key={c.id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-md transition-all">
                                {editingCompanion?.id === c.id ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <input value={editingCompanion.name} onChange={e => setEditingCompanion({...editingCompanion, name: e.target.value})} className="w-full p-2 border rounded bg-white" placeholder="Name" />
                                        <input value={editingCompanion.specialty} onChange={e => setEditingCompanion({...editingCompanion, specialty: e.target.value})} className="w-full p-2 border rounded bg-white" placeholder="Specialty" />
                                        <input value={editingCompanion.imageUrl} onChange={e => setEditingCompanion({...editingCompanion, imageUrl: e.target.value})} className="w-full p-2 border rounded bg-white" placeholder="Image URL" />
                                        <input value={editingCompanion.replicaId} onChange={e => setEditingCompanion({...editingCompanion, replicaId: e.target.value})} className="w-full p-2 border rounded bg-white font-mono text-xs" placeholder="Replica ID" />
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 bg-black text-white py-2 rounded font-bold text-xs">SAVE</button>
                                            <button type="button" onClick={() => setEditingCompanion(null)} className="flex-1 bg-gray-200 py-2 rounded font-bold text-xs">CANCEL</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-4 mb-4">
                                            <img src={c.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt={c.name} />
                                            <div>
                                                <h3 className="font-bold text-lg">{c.name}</h3>
                                                <p className="text-xs text-gray-500">{c.specialty}</p>
                                                <p className="text-[10px] font-mono text-gray-400 mt-1">{c.replicaId}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            {['AVAILABLE', 'BUSY', 'OFFLINE'].map((s: any) => (
                                                <button 
                                                    key={s}
                                                    onClick={() => handleStatusChange(c.id, s)}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all ${c.status === s ? (s === 'AVAILABLE' ? 'bg-green-500 text-white border-green-500' : s === 'BUSY' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-red-500 text-white border-red-500') : 'bg-transparent border-gray-200 text-gray-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setEditingCompanion(c)} className="w-full py-2 rounded border border-gray-200 hover:bg-gray-50 text-xs font-bold flex items-center justify-center gap-2">
                                            <Edit2 className="w-3 h-3" /> Edit Profile
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                     </div>
                  </>
              )}

              {activeTab === 'settings' && (
                  <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-sm">
                          <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Globe className="w-5 h-5" /> Site Configuration</h3>
                          <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                  <div>
                                      <p className="font-bold">Maintenance Mode</p>
                                      <p className="text-xs text-gray-500">Locks site for non-admins</p>
                                  </div>
                                  <button onClick={() => toggleSetting('maintenanceMode')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}>
                                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                                  </button>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                  <div>
                                      <p className="font-bold">Allow Signups</p>
                                      <p className="text-xs text-gray-500">New user registration</p>
                                  </div>
                                  <button onClick={() => toggleSetting('allowSignups')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.allowSignups ? 'bg-green-500' : 'bg-gray-200'}`}>
                                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowSignups ? 'left-7' : 'left-1'}`}></div>
                                  </button>
                              </div>
                              <div>
                                  <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Global Broadcast Message</label>
                                  <div className="flex gap-2">
                                      <input disabled value={settings.broadcastMessage || ''} className="flex-1 p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" />
                                      <button onClick={handleBroadcast} className="px-4 bg-black text-white rounded-xl font-bold text-sm">Edit</button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-sm">
                          <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><HardDrive className="w-5 h-5" /> Data Management</h3>
                          <div className="grid grid-cols-2 gap-4">
                               <button onClick={() => Database.exportData('USERS')} className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-yellow-50 transition flex flex-col items-center gap-2">
                                   <Download className="w-6 h-6 text-gray-600" />
                                   <span className="font-bold text-sm">Export Users JSON</span>
                               </button>
                               <button onClick={() => Database.exportData('LOGS')} className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-yellow-50 transition flex flex-col items-center gap-2">
                                   <Terminal className="w-6 h-6 text-gray-600" />
                                   <span className="font-bold text-sm">Export System Logs</span>
                               </button>
                          </div>
                          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                              <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2"><AlertOctagon className="w-4 h-4"/> Danger Zone</h4>
                              <p className="text-xs text-red-600 mb-4">Irreversible actions for system reset.</p>
                              <button onClick={() => { if(confirm("NUKE DATABASE?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700">
                                  FLUSH ENTIRE DATABASE
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'security' && (
                  <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 font-mono text-sm">
                      <div className="bg-gray-900 px-6 py-3 border-b border-gray-800 flex justify-between items-center">
                          <span className="text-gray-400 flex items-center gap-2"><Terminal className="w-4 h-4"/> SYSTEM_LOG_STREAM</span>
                          <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                      </div>
                      <div className="p-6 h-[500px] overflow-y-auto space-y-2">
                          {logs.map(log => (
                              <div key={log.id} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors">
                                  <span className="text-gray-500 w-32 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                  <span className={`w-20 font-bold flex-shrink-0 ${
                                      log.type === 'ERROR' ? 'text-red-500' : 
                                      log.type === 'WARNING' ? 'text-yellow-500' : 
                                      log.type === 'SUCCESS' ? 'text-green-500' : 
                                      log.type === 'SECURITY' ? 'text-purple-500' : 'text-blue-500'
                                  }`}>{log.type}</span>
                                  <span className="text-white font-bold">{log.event}:</span>
                                  <span className="text-gray-400">{log.details}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'marketing' && (
                  <div className="grid md:grid-cols-3 gap-6">
                       <div className="md:col-span-1 space-y-6">
                            <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm">
                                <h3 className="font-bold text-lg mb-4">Create Promo Code</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Code Name</label>
                                        <input 
                                            value={newPromoCode.code}
                                            onChange={e => setNewPromoCode({...newPromoCode, code: e.target.value.toUpperCase()})}
                                            className="w-full p-3 rounded-xl border border-gray-200 mt-1 font-mono uppercase" 
                                            placeholder="SUMMER2025"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Discount %</label>
                                        <input 
                                            type="number"
                                            value={newPromoCode.discount}
                                            onChange={e => setNewPromoCode({...newPromoCode, discount: Number(e.target.value)})}
                                            className="w-full p-3 rounded-xl border border-gray-200 mt-1" 
                                        />
                                    </div>
                                    <button onClick={handleCreatePromo} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                                        Create Code
                                    </button>
                                </div>
                            </div>
                       </div>
                       <div className="md:col-span-2">
                            <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm h-full">
                                <h3 className="font-bold text-lg mb-4">Active Campaigns</h3>
                                <div className="space-y-3">
                                    {promos.length === 0 && <p className="text-gray-500 italic">No active promo codes.</p>}
                                    {promos.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-100 rounded-lg text-green-600"><Tag className="w-6 h-6" /></div>
                                                <div>
                                                    <h4 className="font-bold text-lg font-mono">{p.code}</h4>
                                                    <p className="text-xs text-gray-500">{p.discountPercentage}% Discount • {p.uses} redemptions</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeletePromo(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><X className="w-5 h-5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                       </div>
                  </div>
              )}

          </div>
      </div>

      {/* MODALS */}
      {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl p-8 animate-float" style={{animation: 'none'}}>
                  <h3 className="text-2xl font-bold mb-2">Grant Credits</h3>
                  <p className="text-gray-500 mb-6">Add free credits to {selectedUser.name}'s wallet.</p>
                  
                  <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Minutes Amount</label>
                      <input 
                          type="number" 
                          className="w-full p-4 text-2xl font-bold border border-gray-300 rounded-xl text-center focus:border-peutic-yellow outline-none"
                          value={fundAmount}
                          onChange={e => setFundAmount(Number(e.target.value))}
                      />
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setShowUserModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
                      <button onClick={handleAddFunds} className="flex-1 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-900 shadow-lg">Grant Funds</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
