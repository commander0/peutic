import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, Line, ComposedChart, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
    Users, DollarSign, Activity, LogOut, Settings, Video, 
    Search, Edit2, Ban, Zap, ShieldAlert, 
    Terminal, Globe, AlertOctagon, Megaphone, Menu, X, Gift, Download, Tag,
    Clock, Wifi, WifiOff, Server, Cpu, HardDrive, Eye, Heart, Lock, CheckCircle, AlertTriangle, 
    FileText, MessageSquare, Repeat, Shield, Plus, Trash2, Send, Power, Image as ImageIcon, RefreshCw
} from 'lucide-react';
import { Database, STABLE_AVATAR_POOL } from '../services/database';
import { User, UserRole, Companion, Transaction, GlobalSettings, SystemLog, ServerMetric, PromoCode } from '../types';

// --- MOVED STATCARD OUTSIDE TO PREVENT RENDER CRASHES ---
const StatCard = ({ title, value, icon: Icon, subValue, subLabel }: any) => (
  <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl shadow-lg hover:border-yellow-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
          <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
          </div>
          <div className="p-3 rounded-xl bg-black border border-gray-800 group-hover:text-yellow-500 transition-colors">
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" />
          </div>
      </div>
      {subValue && (
          <div className="flex items-center gap-2 text-xs">
              <span className="text-green-500 font-bold">{subValue}</span>
              <span className="text-gray-600">{subLabel}</span>
          </div>
      )}
  </div>
);

// --- THE "INFINITY" AVATAR COMPONENT ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [usePool, setUsePool] = useState(false);

    useEffect(() => {
        if (src && src.length > 10) { 
            setImgSrc(src);
            setUsePool(false);
        } else {
            setUsePool(true);
        }
    }, [src]);

    const getStableImage = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % STABLE_AVATAR_POOL.length;
        return STABLE_AVATAR_POOL[index];
    };

    return (
        <img 
            src={usePool ? getStableImage(alt) : imgSrc} 
            alt={alt} 
            className={`${className} object-cover object-center`}
            onError={() => setUsePool(true)}
            loading="lazy"
        />
    );
};

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'specialists' | 'financials' | 'marketing' | 'settings' | 'security'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real Data States
  const [users, setUsers] = useState<User[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(Database.getSettings());
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [metrics, setMetrics] = useState<ServerMetric[]>([]);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [newPromo, setNewPromo] = useState({ code: '', discount: 10 });
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  
  // User Edit Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState(0);

  // Image Edit Modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Refresh Loop
  useEffect(() => {
    const refresh = () => {
        setUsers(Database.getAllUsers());
        setCompanions(Database.getCompanions());
        setTransactions(Database.getAllTransactions());
        setSettings(Database.getSettings());
        setLogs(Database.getSystemLogs());
        setPromos(Database.getPromoCodes());
        setMetrics(Database.getServerMetrics());
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- DERIVED ANALYTICS (REAL DATA) ---
  const totalRevenue = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + (t.cost || 0), 0);
  const activeSessionsCount = metrics[0]?.activeSessions || 0;
  
  // Revenue Chart Data (Group by Date)
  const revenueByDate = transactions
    .filter(t => t.amount > 0)
    .reduce((acc: any, t) => {
        const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + (t.cost || 0);
        return acc;
    }, {});
  const revenueChartData = Object.entries(revenueByDate).map(([name, value]) => ({ name, value })).slice(-7); // Last 7 days

  // --- ACTIONS ---

  const toggleUserBan = (user: User) => {
      if (confirm(`Are you sure you want to ${user.subscriptionStatus === 'BANNED' ? 'unban' : 'ban'} ${user.name}?`)) {
          const updated = { ...user, subscriptionStatus: user.subscriptionStatus === 'BANNED' ? 'ACTIVE' : 'BANNED' as any };
          Database.updateUser(updated);
      }
  };

  const handleAddFunds = () => {
      if (selectedUser && fundAmount > 0) {
          Database.topUpWallet(fundAmount, 0, selectedUser.id); 
          Database.logSystemEvent('WARNING', 'Admin Grant', `Granted ${fundAmount} mins to ${selectedUser.email}`);
          setShowUserModal(false);
          setFundAmount(0);
          setSelectedUser(null);
      }
  };

  const openFundModal = (user: User) => {
      setSelectedUser(user);
      setFundAmount(0);
      setShowUserModal(true);
  };

  const updateCompanionStatus = (id: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
      const comp = companions.find(c => c.id === id);
      if (comp) {
          const updated = { ...comp, status };
          Database.updateCompanion(updated);
      }
  };

  const openImageModal = (companion: Companion) => {
      setSelectedCompanion(companion);
      setNewImageUrl(companion.imageUrl);
      setShowImageModal(true);
  };

  const handleUpdateImage = () => {
      if (selectedCompanion && newImageUrl) {
          const updated = { ...selectedCompanion, imageUrl: newImageUrl };
          Database.updateCompanion(updated);
          Database.logSystemEvent('INFO', 'Companion Update', `Updated image for ${selectedCompanion.name}`);
          setShowImageModal(false);
          setSelectedCompanion(null);
      }
  };

  const handleCreatePromo = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPromo.code && newPromo.discount > 0) {
          Database.createPromoCode(newPromo.code, newPromo.discount);
          setNewPromo({ code: '', discount: 10 });
      }
  };

  const handleDeletePromo = (id: string) => {
      Database.deletePromoCode(id);
  };

  const toggleSetting = (key: keyof GlobalSettings) => {
      Database.saveSettings({ ...settings, [key]: !settings[key] });
  };

  const handleBroadcast = () => {
      const msg = prompt("Enter broadcast message (leave empty to clear):", settings.broadcastMessage || "");
      if (msg !== null) {
          Database.saveSettings({ ...settings, broadcastMessage: msg });
          Database.logSystemEvent('INFO', 'Broadcast Update', `Message: ${msg || 'Cleared'}`);
      }
  };

  const handleSendEmailBlast = (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastSubject || !broadcastBody) return;
      
      // Simulate sending to all users
      const recipientCount = users.length;
      Database.logSystemEvent('INFO', 'Email Marketing', `Email blast sent to ${recipientCount} users. Subject: ${broadcastSubject}`);
      
      setBroadcastSent(true);
      setBroadcastSubject('');
      setBroadcastBody('');
      
      setTimeout(() => setBroadcastSent(false), 3000);
  };

  const handleMassReset = () => {
      if(confirm("Are you sure you want to reset all specialists to AVAILABLE?")) {
          Database.setAllCompanionsStatus('AVAILABLE');
          // Force refresh
          setCompanions(Database.getCompanions());
      }
  };

  const handleExportData = (type: 'USERS' | 'LOGS') => {
      Database.exportData(type);
  };

  // --- RENDER HELPERS ---
  const filteredUsers = users.filter(u => {
      const s = searchTerm.toLowerCase();
      const matches = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
      if (userFilter === 'BANNED') return matches && u.subscriptionStatus === 'BANNED';
      if (userFilter === 'ADMIN') return matches && u.role === UserRole.ADMIN;
      return matches;
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans flex">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4 z-50">
          <span className="font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-500"/> Admin</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="w-6 h-6" /></button>
      </div>

      {/* SIDEBAR */}
      <div className={`
          fixed md:static inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-gray-800 z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
      `}>
          <div className="p-6 border-b border-gray-800">
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center"><Activity className="w-5 h-5 text-black"/></div>
                  PEUTIC<span className="text-gray-600">OS</span>
              </h1>
          </div>
          <div className="flex-1 py-6 space-y-1 px-3">
              {[
                  { id: 'overview', icon: Activity, label: 'Mission Control' },
                  { id: 'users', icon: Users, label: 'User Database' },
                  { id: 'specialists', icon: Video, label: 'Specialist Ops' },
                  { id: 'financials', icon: DollarSign, label: 'Financials' },
                  { id: 'marketing', icon: Megaphone, label: 'Marketing CMS' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'security', icon: ShieldAlert, label: 'Security Logs' }
              ].map((item) => (
                  <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                  >
                      <item.icon className="w-4 h-4" /> {item.label}
                  </button>
              ))}
          </div>
          <div className="p-4 border-t border-gray-800">
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-red-500 hover:bg-red-900/20 font-bold text-xs uppercase tracking-wider transition-colors">
                  <LogOut className="w-4 h-4" /> Terminate Session
              </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto h-screen p-4 md:p-8 pt-20 md:pt-8">
          
          {/* PAGE HEADER */}
          <div className="flex justify-between items-end mb-8">
              <div>
                  <h2 className="text-3xl font-black text-white tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-gray-500 text-sm mt-1">System Status: <span className="text-green-500 font-bold">Operational</span></p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase">Server Time</p>
                      <p className="text-white font-mono">{new Date().toLocaleTimeString()}</p>
                  </div>
              </div>
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard title="Lifetime Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} subValue="+12%" subLabel="vs last month" />
                      <StatCard title="Total Users" value={users.length} icon={Users} subValue={`+${users.filter(u => new Date(u.joinedAt).getDate() === new Date().getDate()).length}`} subLabel="today" />
                      <StatCard title="Active Sessions" value={activeSessionsCount} icon={Video} subValue={`${settings.maxConcurrentSessions} max`} subLabel="capacity" />
                      <StatCard title="System Health" value="99.9%" icon={Server} />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-500"/> Revenue Trend (Last 7 Days)</h3>
                          <div className="h-[300px]">
                              {revenueChartData.length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={revenueChartData}>
                                          <defs>
                                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                                                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                          <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                          <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(val) => `$${val}`} />
                                          <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} formatter={(val: number) => [`$${val.toFixed(2)}`, 'Revenue']} />
                                          <Area type="monotone" dataKey="value" stroke="#EAB308" strokeWidth={3} fill="url(#colorRev)" />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              ) : (
                                  <div className="h-full flex items-center justify-center text-gray-600 font-mono">No transaction data yet.</div>
                              )}
                          </div>
                      </div>

                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                          <div className="space-y-4">
                              {logs.slice(0, 6).map(log => (
                                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-gray-800/50">
                                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'ERROR' || log.type === 'SECURITY' ? 'bg-red-500' : log.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                      <div className="overflow-hidden">
                                          <p className="text-xs font-bold text-gray-300 truncate">{log.event}</p>
                                          <p className="text-xs text-gray-500 truncate">{log.details}</p>
                                          <p className="text-[10px] text-gray-600 font-mono mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: SPECIALISTS (REAL OPS) */}
          {activeTab === 'specialists' && (
              <div>
                  <div className="flex justify-end mb-6">
                      <button onClick={handleMassReset} className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-700 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" /> Reset All Statuses
                      </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {companions.map(c => (
                          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all shadow-lg group relative">
                              <div className="h-48 bg-gray-800 relative">
                                  <AvatarImage 
                                      src={c.imageUrl} 
                                      alt={c.name} 
                                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${c.status === 'AVAILABLE' ? 'bg-green-500 text-black' : c.status === 'BUSY' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                                      {c.status}
                                  </div>
                                  <div className="absolute bottom-4 left-4">
                                      <h3 className="text-xl font-bold text-white">{c.name}</h3>
                                      <p className="text-xs text-gray-400">{c.specialty}</p>
                                  </div>
                                  <button 
                                      onClick={() => openImageModal(c)}
                                      className="absolute top-3 left-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors z-10"
                                      title="Edit Avatar Image"
                                  >
                                      <ImageIcon className="w-4 h-4" />
                                  </button>
                              </div>
                              <div className="p-6">
                                  <div className="flex justify-between items-center mb-6 text-xs font-mono text-gray-500">
                                      <span>ID: {c.replicaId.substring(0, 6)}...</span>
                                      <span className="flex items-center gap-1 text-yellow-500"><Eye className="w-3 h-3"/> 4.9/5.0</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                      <button onClick={() => updateCompanionStatus(c.id, 'AVAILABLE')} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${c.status === 'AVAILABLE' ? 'bg-green-900/50 border-green-500/50 text-green-400' : 'border-gray-800 hover:bg-gray-800 text-gray-500'}`}><Wifi className="w-3 h-3 mx-auto mb-1"/> Online</button>
                                      <button onClick={() => updateCompanionStatus(c.id, 'BUSY')} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${c.status === 'BUSY' ? 'bg-yellow-900/50 border-yellow-500/50 text-yellow-400' : 'border-gray-800 hover:bg-gray-800 text-gray-500'}`}><Clock className="w-3 h-3 mx-auto mb-1"/> Busy</button>
                                      <button onClick={() => updateCompanionStatus(c.id, 'OFFLINE')} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${c.status === 'OFFLINE' ? 'bg-red-900/50 border-red-500/50 text-red-400' : 'border-gray-800 hover:bg-gray-800 text-gray-500'}`}><WifiOff className="w-3 h-3 mx-auto mb-1"/> Offline</button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* TAB: FINANCIALS */}
          {activeTab === 'financials' && (
              <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                          <h3 className="font-bold text-white text-lg mb-6">Daily Revenue</h3>
                          <div className="h-[300px]">
                              {revenueChartData.length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={revenueChartData}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                          <XAxis dataKey="name" stroke="#6B7280" />
                                          <YAxis stroke="#6B7280" tickFormatter={(val) => `$${val}`} />
                                          <Tooltip cursor={{fill: '#333'}} contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                                          <Bar dataKey="value" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={40} />
                                      </BarChart>
                                  </ResponsiveContainer>
                              ) : <div className="h-full flex items-center justify-center text-gray-500">No Data Available</div>}
                          </div>
                      </div>
                      
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
                          <h3 className="font-bold text-white text-lg mb-6">Transaction Ledger</h3>
                          <div className="flex-1 overflow-auto pr-2">
                              <table className="w-full text-left text-sm">
                                  <thead className="text-gray-500 font-bold uppercase border-b border-gray-800">
                                      <tr><th className="pb-3">User</th><th className="pb-3">Desc</th><th className="pb-3 text-right">Amount</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-800">
                                      {transactions.slice().reverse().slice(0, 10).map(t => (
                                          <tr key={t.id}>
                                              <td className="py-3 text-gray-300">{t.userName || 'Unknown'}</td>
                                              <td className="py-3 text-gray-500 text-xs">{t.description}</td>
                                              <td className={`py-3 text-right font-mono font-bold ${t.amount > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                                                  {t.amount > 0 ? `+$${t.cost?.toFixed(2)}` : `${t.amount}m`}
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: MARKETING CMS */}
          {activeTab === 'marketing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                      <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2"><Megaphone className="w-5 h-5 text-yellow-500"/> Create Promo Code</h3>
                      <form onSubmit={handleCreatePromo} className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Code Name</label>
                              <input 
                                  type="text" 
                                  placeholder="SUMMER25" 
                                  className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none font-mono uppercase"
                                  value={newPromo.code}
                                  onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Discount %</label>
                              <input 
                                  type="number" 
                                  min="1" max="100"
                                  className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none font-mono"
                                  value={newPromo.discount}
                                  onChange={e => setNewPromo({...newPromo, discount: parseInt(e.target.value)})}
                              />
                          </div>
                          <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2">
                              <Plus className="w-4 h-4" /> Create Code
                          </button>
                      </form>

                      <div className="mt-8">
                          <h3 className="font-bold text-white text-lg mb-4">Active Campaigns</h3>
                          <div className="space-y-2">
                              {promos.map(p => (
                                  <div key={p.id} className="bg-black border border-gray-800 p-3 rounded-lg flex justify-between items-center">
                                      <div><span className="font-mono font-bold text-yellow-500">{p.code}</span> <span className="text-xs text-gray-500">({p.discountPercentage}%)</span></div>
                                      <button onClick={() => handleDeletePromo(p.id)} className="text-gray-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                      <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-blue-500"/> News & Updates Blast</h3>
                      {broadcastSent ? (
                          <div className="bg-green-900/20 border border-green-900 p-4 rounded-xl text-center">
                              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                              <p className="text-green-400 font-bold">Update Sent to {users.length} Users</p>
                          </div>
                      ) : (
                          <form onSubmit={handleSendEmailBlast} className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Subject</label>
                                  <input 
                                      required
                                      type="text" 
                                      placeholder="Important Update: New Features..." 
                                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                      value={broadcastSubject}
                                      onChange={e => setBroadcastSubject(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message Body</label>
                                  <textarea 
                                      required
                                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-32 resize-none"
                                      placeholder="Dear user..."
                                      value={broadcastBody}
                                      onChange={e => setBroadcastBody(e.target.value)}
                                  ></textarea>
                              </div>
                              <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 flex items-center justify-center gap-2">
                                  <Send className="w-4 h-4" /> Send Broadcast
                              </button>
                          </form>
                      )}
                  </div>
              </div>
          )}

          {/* TAB: USERS */}
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
                                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${userFilter === f ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-gray-500 border-gray-700 hover:border-gray-500'}`}
                              >
                                  {f}
                              </button>
                          ))}
                          <button 
                              onClick={() => handleExportData('USERS')} 
                              className="px-4 py-2 rounded-lg text-xs font-bold border border-blue-900 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2"
                          >
                              <Download className="w-3 h-3" /> Export
                          </button>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-black text-gray-500 font-bold text-xs uppercase tracking-wider">
                              <tr>
                                  <th className="px-6 py-4">Identity</th>
                                  <th className="px-6 py-4">Provider</th>
                                  <th className="px-6 py-4">Balance</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                              {filteredUsers.map(u => (
                                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                                                  <img src={u.avatar} className="w-full h-full" alt=""/>
                                              </div>
                                              <div>
                                                  <p className="font-bold text-white text-sm">{u.name}</p>
                                                  <p className="text-xs text-gray-500">{u.email}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="text-xs font-mono text-gray-400 uppercase bg-gray-800 px-2 py-1 rounded">{u.provider || 'email'}</span>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-yellow-500 font-bold">{u.balance}m</td>
                                      <td className="px-6 py-4">
                                          {u.subscriptionStatus === 'BANNED' ? 
                                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-900/50 text-red-400 border border-red-900">BANNED</span> : 
                                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-900/50 text-green-400 border border-green-900">ACTIVE</span>
                                          }
                                      </td>
                                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                                          <button onClick={() => openFundModal(u)} className="p-2 hover:bg-green-900/30 text-green-500 rounded-lg transition-colors" title="Grant Funds"><Gift className="w-4 h-4"/></button>
                                          <button onClick={() => toggleUserBan(u)} className="p-2 hover:bg-red-900/30 text-red-500 rounded-lg transition-colors" title="Ban User"><Ban className="w-4 h-4"/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                      <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-yellow-500" /> Global Configuration</h3>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-gray-800">
                              <div className="flex items-center gap-3">
                                  <Power className={`w-5 h-5 ${settings.maintenanceMode ? 'text-red-500' : 'text-gray-500'}`} />
                                  <div><p className="font-bold text-white">Maintenance Mode</p><p className="text-xs text-gray-500">Emergency lockdown</p></div>
                              </div>
                              <button onClick={() => toggleSetting('maintenanceMode')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div></button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-gray-800">
                              <div className="flex items-center gap-3">
                                  <Globe className={`w-5 h-5 ${settings.multilingualMode ? 'text-green-500' : 'text-gray-500'}`} />
                                  <div><p className="font-bold text-white">Multilingual AI</p><p className="text-xs text-gray-500">Auto-detect languages</p></div>
                              </div>
                              <button onClick={() => toggleSetting('multilingualMode')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.multilingualMode ? 'bg-green-500' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.multilingualMode ? 'left-7' : 'left-1'}`}></div></button>
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

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800"><h3 className="text-xl font-bold text-white">Security Audit Log</h3></div>
                  <div className="max-h-[600px] overflow-y-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-black text-gray-500 sticky top-0"><tr><th className="px-6 py-3">Level</th><th className="px-6 py-3">Event</th><th className="px-6 py-3">Time</th></tr></thead>
                          <tbody className="divide-y divide-gray-800">
                              {logs.map(log => (
                                  <tr key={log.id} className="hover:bg-white/5 font-mono">
                                      <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold ${log.type === 'ERROR' ? 'bg-red-900 text-red-400' : log.type === 'WARNING' ? 'bg-yellow-900 text-yellow-400' : 'bg-blue-900 text-blue-400'}`}>{log.type}</span></td>
                                      <td className="px-6 py-3 text-gray-300">{log.event} <span className="text-gray-600">- {log.details}</span></td>
                                      <td className="px-6 py-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

      </div>

      {/* USER MODAL */}
      {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-2">Grant Credits</h3>
                  <p className="text-gray-400 mb-6 text-sm">Add promotional funds to {selectedUser.name}'s wallet.</p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                      <button onClick={() => setFundAmount(Math.max(0, fundAmount - 10))} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"><Settings className="w-4 h-4" /></button>
                      <input 
                          type="number" 
                          className="w-32 p-4 text-3xl font-black bg-black border border-gray-700 rounded-xl text-center text-white focus:border-yellow-500 outline-none"
                          value={fundAmount}
                          onChange={e => setFundAmount(Number(e.target.value))}
                      />
                      <button onClick={() => setFundAmount(fundAmount + 10)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setShowUserModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleAddFunds} className="flex-1 py-3 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-900/20">Confirm Grant</button>
                  </div>
              </div>
          </div>
      )}

      {/* IMAGE EDIT MODAL */}
      {showImageModal && selectedCompanion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-2">Update Avatar Image</h3>
                  <p className="text-gray-400 mb-6 text-sm">Change the display image for {selectedCompanion.name}.</p>
                  
                  <div className="mb-6 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden border-4 border-yellow-500">
                          <AvatarImage src={newImageUrl || selectedCompanion.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                  </div>

                  <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL</label>
                      <input 
                          className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none text-xs"
                          value={newImageUrl}
                          onChange={e => setNewImageUrl(e.target.value)}
                          placeholder="https://..."
                      />
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setShowImageModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleUpdateImage} className="flex-1 py-3 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-900/20">Update Image</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;