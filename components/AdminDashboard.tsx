
import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, Line, ComposedChart, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
    Users, DollarSign, Activity, LogOut, Settings, Video, 
    Search, Edit2, Ban, Zap, ShieldAlert, 
    Terminal, Globe, AlertOctagon, Megaphone, Menu, X, Gift, Download, Tag,
    Clock, Wifi, Server, Cpu, HardDrive, Eye, Heart, Lock, CheckCircle, AlertTriangle, 
    FileText, MessageSquare, Repeat, Shield
} from 'lucide-react';
import { Database } from '../services/database';
import { User, UserRole, Companion, Transaction, GlobalSettings, SystemLog, ServerMetric, PromoCode } from '../types';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'specialists' | 'financials' | 'marketing' | 'settings' | 'security'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleAddFunds = () => {
      if (selectedUser && fundAmount > 0) {
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

  // Calculation for Financials
  const totalRevenue = transactions.reduce((a,b) => a + (b.cost||0), 0);
  const burnRate = 500 + (metrics[0]?.activeSessions || 0) * 0.10; // Simulated burn rate
  const netProfit = totalRevenue - burnRate;

  // Filtered Lists
  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (userFilter === 'ADMIN') return matchesSearch && u.role === UserRole.ADMIN;
      if (userFilter === 'BANNED') return matchesSearch && u.subscriptionStatus === 'BANNED';
      return matchesSearch;
  });

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-yellow-500/50 transition-all">
          <div className="flex justify-between items-start">
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
                  <h3 className="text-3xl font-black text-white">{value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-black border border-white/10 group-hover:text-yellow-500 transition-colors`}>
                  <Icon className="w-6 h-6 text-gray-300 group-hover:text-yellow-500" />
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center"><Shield className="w-4 h-4 text-black fill-black"/></div>
             <span className="font-bold text-white">Command Center</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="w-6 h-6 text-white" /></button>
      </div>

      {/* SIDEBAR */}
      <div className={`
          fixed md:static inset-y-0 left-0 w-72 bg-black border-r border-gray-800 z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
      `}>
          <div className="p-8 border-b border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                      <Shield className="w-6 h-6 text-black fill-black" />
                  </div>
                  <h1 className="text-xl font-black text-white tracking-tighter">PEUTIC<span className="text-yellow-500">OS</span></h1>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] ml-1">Restricted Access</p>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
              {[
                  { id: 'overview', icon: Activity, label: 'Mission Control' },
                  { id: 'users', icon: Users, label: 'User Database' },
                  { id: 'specialists', icon: Video, label: 'Specialist Grid' },
                  { id: 'financials', icon: DollarSign, label: 'Financials' },
                  { id: 'marketing', icon: Megaphone, label: 'Marketing CMS' },
                  { id: 'settings', icon: Settings, label: 'Global Config' },
                  { id: 'security', icon: ShieldAlert, label: 'Security Logs' }
              ].map((item) => (
                  <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === item.id ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                  >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                  </button>
              ))}
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
               <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-500 transition-all text-sm font-bold text-gray-400">
                  <LogOut className="w-4 h-4" /> Sign Out
              </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
          
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-500 font-mono uppercase">System Online</span>
                  </div>
              </div>
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-6">
              
              {activeTab === 'overview' && (
                  <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} />
                          <StatCard title="Registered Users" value={users.length} icon={Users} />
                          <StatCard title="Active Sessions" value={metrics[0]?.activeSessions || 0} icon={Video} />
                          <StatCard title="System Health" value="99.9%" icon={Server} />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                              <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-500"/> Live System Load</h3>
                              <div className="h-[300px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={metrics}>
                                          <defs>
                                              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8}/>
                                                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                          <XAxis dataKey="time" stroke="#6B7280" fontSize={10} />
                                          <YAxis stroke="#6B7280" fontSize={10} />
                                          <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', border: '1px solid #333' }} />
                                          <Area type="monotone" dataKey="cpu" stroke="#EAB308" fill="url(#colorCpu)" />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>

                          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                              <h3 className="font-bold text-white mb-6">Network Status</h3>
                              <div className="space-y-6">
                                  {[
                                      { label: 'CPU Load', val: metrics[0]?.cpu, color: 'bg-blue-500' },
                                      { label: 'Memory Usage', val: metrics[0]?.memory, color: 'bg-purple-500' },
                                      { label: 'API Latency (ms)', val: metrics[0]?.latency, color: 'bg-green-500', max: 200 }
                                  ].map((m, i) => (
                                      <div key={i}>
                                          <div className="flex justify-between text-sm mb-1">
                                              <span className="text-gray-500 font-bold">{m.label}</span>
                                              <span className="font-mono text-white">{m.val.toFixed(1)}</span>
                                          </div>
                                          <div className="w-full bg-gray-800 h-1 rounded-full">
                                              <div className={`${m.color} h-1 rounded-full transition-all duration-500`} style={{ width: `${(m.val / (m.max || 100)) * 100}%` }}></div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </>
              )}

              {activeTab === 'financials' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                          <h3 className="text-white font-bold text-xl mb-4">Revenue vs Burn</h3>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'Today', revenue: totalRevenue, burn: burnRate }]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                    <XAxis dataKey="name" stroke="#6B7280"/>
                                    <YAxis stroke="#6B7280"/>
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}/>
                                    <Legend />
                                    <Bar dataKey="revenue" name="Gross Revenue" fill="#22C55E" barSize={60} />
                                    <Bar dataKey="burn" name="Est. Burn Rate" fill="#EF4444" barSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                          </div>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                           <h3 className="text-white font-bold text-xl mb-4">Unit Economics</h3>
                           <div className="space-y-4">
                               <div className="flex justify-between p-4 bg-black rounded-xl border border-gray-800">
                                   <span className="text-gray-400">Net Profit (Today)</span>
                                   <span className={`font-mono font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>${netProfit.toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between p-4 bg-black rounded-xl border border-gray-800">
                                   <span className="text-gray-400">ARPU (Avg Revenue Per User)</span>
                                   <span className="font-mono font-bold text-white">${(totalRevenue / (users.length || 1)).toFixed(2)}</span>
                               </div>
                           </div>
                      </div>
                  </div>
              )}

              {activeTab === 'users' && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative w-full md:w-96">
                              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                              <input 
                                  type="text" 
                                  placeholder="Search user database..." 
                                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white focus:border-yellow-500 outline-none"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                          <div className="flex gap-2">
                              {['ALL', 'ADMIN', 'BANNED'].map(f => (
                                  <button 
                                      key={f}
                                      onClick={() => setUserFilter(f)}
                                      className={`px-4 py-2 rounded-lg text-xs font-bold border ${userFilter === f ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-gray-500 border-gray-700'}`}
                                  >
                                      {f}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-black text-gray-500 font-bold text-xs uppercase tracking-wider">
                                  <tr>
                                      <th className="px-6 py-4">Identity</th>
                                      <th className="px-6 py-4">Method</th>
                                      <th className="px-6 py-4">Balance</th>
                                      <th className="px-6 py-4">Role</th>
                                      <th className="px-6 py-4 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                  {filteredUsers.map(u => (
                                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <img src={u.avatar} className="w-8 h-8 rounded-full" alt="" />
                                                  <div>
                                                      <p className="font-bold text-white">{u.name}</p>
                                                      <p className="text-xs text-gray-500">{u.email}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="text-xs font-mono text-gray-400 uppercase">{u.provider || 'email'}</span>
                                          </td>
                                          <td className="px-6 py-4 font-mono text-yellow-500">{u.balance}m</td>
                                          <td className="px-6 py-4">
                                              <span className={`text-[10px] font-bold px-2 py-1 rounded ${u.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' : 'bg-gray-800 text-gray-400'}`}>{u.role}</span>
                                          </td>
                                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                                              <button onClick={() => openFundModal(u)} className="p-2 hover:bg-green-900/30 text-green-500 rounded"><Gift className="w-4 h-4"/></button>
                                              <button onClick={() => handleBanUser(u)} className="p-2 hover:bg-red-900/30 text-red-500 rounded"><Ban className="w-4 h-4"/></button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab === 'settings' && (
                  <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                          <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-yellow-500" /> Global Configuration</h3>
                          <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-gray-800">
                                  <div><p className="font-bold text-white">Maintenance Mode</p><p className="text-xs text-gray-500">Lockdown site</p></div>
                                  <button onClick={() => toggleSetting('maintenanceMode')} className={`w-12 h-6 rounded-full relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div></button>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-gray-800">
                                  <div><p className="font-bold text-white">Multilingual AI</p><p className="text-xs text-gray-500">Tavus auto-detect</p></div>
                                  <button onClick={() => toggleSetting('multilingualMode')} className={`w-12 h-6 rounded-full relative ${settings.multilingualMode ? 'bg-green-500' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.multilingualMode ? 'left-7' : 'left-1'}`}></div></button>
                              </div>
                              <div>
                                  <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Broadcast Message</label>
                                  <div className="flex gap-2">
                                      <input disabled value={settings.broadcastMessage || ''} className="flex-1 p-3 rounded-xl border border-gray-800 bg-black text-gray-300 text-sm" />
                                      <button onClick={handleBroadcast} className="px-4 bg-yellow-500 text-black rounded-xl font-bold text-sm">Edit</button>
                                  </div>
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
              <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Grant Credits</h3>
                  <p className="text-gray-400 mb-6">Add free credits to {selectedUser.name}'s wallet.</p>
                  <input 
                      type="number" 
                      className="w-full p-4 text-3xl font-black bg-black border border-gray-700 rounded-xl text-center text-white focus:border-yellow-500 outline-none mb-6"
                      value={fundAmount}
                      onChange={e => setFundAmount(Number(e.target.value))}
                  />
                  <div className="flex gap-3">
                      <button onClick={() => setShowUserModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-800 text-gray-400 hover:bg-gray-700">Cancel</button>
                      <button onClick={handleAddFunds} className="flex-1 py-3 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400">Grant Funds</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
