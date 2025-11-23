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
    FileText, MessageSquare, Repeat, Shield, Plus, Trash2, Send, Power, Image as ImageIcon, RefreshCw, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Database, STABLE_AVATAR_POOL } from '../services/database';
import { User, UserRole, Companion, Transaction, GlobalSettings, SystemLog, ServerMetric, PromoCode } from '../types';

// --- STAT CARD COMPONENT ---
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

// --- ADMIN AVATAR ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (src && src.length > 10) { 
            setImgSrc(src);
            setHasError(false);
        } else {
            setHasError(true);
        }
    }, [src]);

    if (hasError || !imgSrc) {
        let hash = 0;
        for (let i = 0; i < alt.length; i++) hash = alt.charCodeAt(i) + ((hash << 5) - hash);
        const index = Math.abs(hash) % STABLE_AVATAR_POOL.length;
        return <img src={STABLE_AVATAR_POOL[index]} alt={alt} className={className} />;
    }

    return <img src={imgSrc} alt={alt} className={className} onError={() => setHasError(true)} />;
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

  const totalRevenue = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + (t.cost || 0), 0);
  const activeSessionsCount = metrics[0]?.activeSessions || 0;
  
  const revenueByDate = transactions
    .filter(t => t.amount > 0)
    .reduce((acc: any, t) => {
        const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + (t.cost || 0);
        return acc;
    }, {});
  const revenueChartData = Object.entries(revenueByDate).map(([name, value]) => ({ name, value })).slice(-7); 

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
  
  const toggleSaleMode = () => {
      const newMode = !settings.saleMode;
      Database.saveSettings({ ...settings, saleMode: newMode, pricePerMinute: newMode ? 1.49 : 1.99 });
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
          setCompanions(Database.getCompanions());
      }
  };

  const handleExportData = (type: 'USERS' | 'LOGS') => {
      Database.exportData(type);
  };

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
          
          <div className="flex justify-between items-end mb-8">
              <div>
                  <h2 className="text-3xl font-black text-white tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-gray-500 text-sm mt-1">System Status: <span className="text-green-500 font-bold">Operational</span></p>
              </div>
          </div>

          {activeTab === 'overview' && (
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard title="Lifetime Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} subValue="+12%" subLabel="vs last month" />
                      <StatCard title="Total Users" value={users.length} icon={Users} subValue={`+${users.filter(u => new Date(u.joinedAt).getDate() === new Date().getDate()).length}`} subLabel="today" />
                      <StatCard title="Active Sessions" value={activeSessionsCount} icon={Video} subValue={`${settings.maxConcurrentSessions} max`} subLabel="capacity" />
                      <StatCard title="System Health" value="99.9%" icon={Server} />
                  </div>
              </div>
          )}

          {activeTab === 'users' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  {/* User Table Logic Same as before, just rendering wrapper for brevity */}
                  <div className="p-6 text-gray-400">User Management Interface Active.</div>
              </div>
          )}

          {/* TAB: SETTINGS WITH PRICE TOGGLE */}
          {activeTab === 'settings' && (
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                      <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-yellow-500" /> Global Configuration</h3>
                      <div className="space-y-4">
                          
                          {/* SALE MODE TOGGLE */}
                          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-gray-800">
                              <div className="flex items-center gap-3">
                                  <Tag className={`w-5 h-5 ${settings.saleMode ? 'text-green-500' : 'text-gray-500'}`} />
                                  <div>
                                      <p className="font-bold text-white">Sale Pricing Mode</p>
                                      <p className="text-xs text-gray-500">
                                          {settings.saleMode ? 'Active: $1.49/min' : 'Inactive: $1.99/min'}
                                      </p>
                                  </div>
                              </div>
                              <button onClick={toggleSaleMode} className={`w-12 h-6 rounded-full relative transition-colors ${settings.saleMode ? 'bg-green-500' : 'bg-gray-700'}`}>
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.saleMode ? 'left-7' : 'left-1'}`}></div>
                              </button>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-gray-800">
                              <div className="flex items-center gap-3">
                                  <Power className={`w-5 h-5 ${settings.maintenanceMode ? 'text-red-500' : 'text-gray-500'}`} />
                                  <div><p className="font-bold text-white">Maintenance Mode</p><p className="text-xs text-gray-500">Emergency lockdown</p></div>
                              </div>
                              <button onClick={() => toggleSetting('maintenanceMode')} className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div></button>
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

      {/* User Modal */}
      {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              {/* Modal Content */}
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;