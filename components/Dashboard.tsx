
import React, { useState, useEffect, useRef } from 'react';
import { User, Companion, Transaction, MoodEntry, JournalEntry } from '../types';
import { 
  Video, CreditCard, Clock, Settings, LogOut, 
  LayoutDashboard, Plus, Search, Filter, X, Lock, CheckCircle, AlertTriangle, ShieldCheck, Heart, Calendar,
  Smile, PenTool, Wind, BookOpen, Save, Sparkles
} from 'lucide-react';
import { generateDailyInsight } from '../services/geminiService';
import { Database } from '../services/database';
import { listReplicas } from '../services/tavusService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onStartSession: (companion: Companion) => void;
}

const STRIPE_PUBLISHABLE_KEY = "pk_live_51MZuG0BUviiBIU4d81PC3BDlYgxuUszLu1InD0FFWOcGwQyNYgn5jjNOYi5a0uic9iuG8FdMjZBqpihTxK7oH0W600KfPZFZwp";

// Define window.Stripe type for TypeScript
declare global {
  interface Window {
    Stripe?: any;
  }
}

const PaymentModal: React.FC<{ onClose: () => void; onSuccess: (amount: number, cost: number) => void; initialError?: string }> = ({ onClose, onSuccess, initialError }) => {
    const [amount, setAmount] = useState(20); // Default $20
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(initialError || null);
    
    const stripeRef = useRef<any>(null);
    const elementsRef = useRef<any>(null);
    const cardElementRef = useRef<any>(null);
    const mountNodeRef = useRef<HTMLDivElement>(null);
    const settings = Database.getSettings();
    const pricePerMin = settings.pricePerMinute;

    useEffect(() => {
        if (!window.Stripe) {
            setError("Stripe failed to load. Please refresh.");
            return;
        }

        // Prevent double initialization
        if (!stripeRef.current) {
            stripeRef.current = window.Stripe(STRIPE_PUBLISHABLE_KEY);
            elementsRef.current = stripeRef.current.elements();
            
            const style = {
                base: {
                    color: "#32325d",
                    fontFamily: '"Manrope", sans-serif',
                    fontSmoothing: "antialiased",
                    fontSize: "16px",
                    "::placeholder": {
                        color: "#aab7c4"
                    }
                },
                invalid: {
                    color: "#fa755a",
                    iconColor: "#fa755a"
                }
            };

            if (!cardElementRef.current) {
                cardElementRef.current = elementsRef.current.create("card", { style: style, hidePostalCode: true });
                // Small timeout to ensure DOM is ready for mounting
                setTimeout(() => {
                    if (mountNodeRef.current) {
                        cardElementRef.current.mount(mountNodeRef.current);
                    }
                }, 100);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripeRef.current || !cardElementRef.current) {
            setError("Payment system not initialized.");
            setProcessing(false);
            return;
        }

        try {
            const result = await stripeRef.current.createToken(cardElementRef.current);

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                // Simulate backend processing
                setTimeout(() => {
                    setProcessing(false);
                    const minutesAdded = Math.floor(amount / pricePerMin);
                    onSuccess(minutesAdded, amount);
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || "Payment failed.");
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-float" style={{animation: 'none'}}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-gray-700">Secure Checkout</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <p className="text-gray-500 text-sm mb-2 font-medium">Select Amount to Add</p>
                        <h2 className="text-5xl font-extrabold tracking-tight mb-6">${amount.toFixed(2)}</h2>
                        <div className="flex justify-center gap-3">
                            {[20, 50, 100].map((val) => (
                                <button 
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${amount === val ? 'bg-black text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3">Adds approx. <span className="font-bold text-black">{Math.floor(amount / pricePerMin)} mins</span> of talk time.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> 
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div ref={mountNodeRef} className="p-2" />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={processing || !window.Stripe}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${processing ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-peutic-yellow text-black hover:bg-yellow-400 hover:scale-[1.02]'}`}
                        >
                            {processing ? <span className="animate-pulse">Processing Securely...</span> : (
                                <>
                                    <Lock className="w-5 h-5" /> Pay ${amount.toFixed(2)}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- BREATHING COMPONENT ---
const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [text, setText] = useState("Inhale");
    
    useEffect(() => {
        const steps = [
            { text: "Inhale", delay: 4000 },
            { text: "Hold", delay: 4000 },
            { text: "Exhale", delay: 4000 },
            { text: "Hold", delay: 4000 }
        ];
        let currentStep = 0;

        const runLoop = () => {
            setText(steps[currentStep].text);
            currentStep = (currentStep + 1) % steps.length;
        };
        
        runLoop();
        const interval = setInterval(runLoop, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <button onClick={onClose} className="absolute top-0 right-0 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
                <div className="absolute inset-0 bg-peutic-yellow/20 rounded-full animate-breathe"></div>
                <div className="absolute inset-12 bg-peutic-yellow/40 rounded-full animate-breathe" style={{ animationDelay: '1s' }}></div>
                <div className="relative z-10 text-center text-white">
                    <h2 className="text-4xl font-bold mb-2">{text}</h2>
                    <p className="text-white/60">Follow the rhythm</p>
                </div>
             </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onStartSession }) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'history' | 'settings'>('hub');
  const [showPayment, setShowPayment] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyInsight, setDailyInsight] = useState<string>('');
  const [balance, setBalance] = useState(user.balance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  
  // Wellness State
  const [mood, setMood] = useState<'Happy'|'Calm'|'Neutral'|'Sad'|'Anxious' | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  
  useEffect(() => {
      // Refresh data from DB logic
      const refreshData = () => {
        const dbUser = Database.getUser();
        if (dbUser) setBalance(dbUser.balance);
        const txs = Database.getUserTransactions(user.id);
        setTransactions(txs);
        setCompanions(Database.getCompanions());
      };

      refreshData();
      const interval = setInterval(refreshData, 5000);

      // Attempt to fetch real Tavus thumbnails on mount
      listReplicas().then(replicas => {
          if (replicas && replicas.length > 0) {
              // Update local state with real images if IDs match
              setCompanions(prev => prev.map(c => {
                  const match = replicas.find((r: any) => r.replica_id === c.replicaId);
                  return match ? { ...c, imageUrl: match.thumbnail_video_url || match.thumbnail_url || c.imageUrl } : c;
              }));
          }
      });

      return () => clearInterval(interval);
  }, [showPayment, user.id]);

  useEffect(() => {
    generateDailyInsight(user.name).then(setDailyInsight);
  }, [user.name]);

  const handlePaymentSuccess = (minutesAdded: number, cost: number) => {
      Database.topUpWallet(minutesAdded, cost);
      setBalance(prev => prev + minutesAdded);
      setShowPayment(false);
      setPaymentError(undefined);
  };

  // STRICT CREDIT CHECK
  const handleConnectRequest = (companion: Companion) => {
      if (balance <= 0) {
          setPaymentError("You need to add credits to start a session.");
          setShowPayment(true);
      } else {
          onStartSession(companion);
      }
  };

  const handleSaveMood = (m: 'Happy'|'Calm'|'Neutral'|'Sad'|'Anxious') => {
      const entry: MoodEntry = {
          id: `mood_${Date.now()}`,
          userId: user.id,
          date: new Date().toISOString(),
          mood: m
      };
      Database.saveMood(entry);
      setMood(null); 
      alert("Mood logged to your secure history.");
  };

  const handleSaveJournal = () => {
      if (!journalContent.trim()) return;
      const entry: JournalEntry = {
          id: `jour_${Date.now()}`,
          userId: user.id,
          date: new Date().toISOString(),
          content: journalContent
      };
      Database.saveJournal(entry);
      setJournalContent('');
      setShowJournal(false);
      alert("Entry saved to secure vault.");
  };

  const filteredCompanions = companions.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-[#FFFBEB] border-b border-yellow-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-peutic-yellow rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200/50">
                   <Heart className="w-6 h-6 fill-black text-black" />
               </div>
               <span className="text-xl font-bold tracking-tight hidden md:block">Peutic</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:block px-4 py-2 bg-white rounded-lg border border-yellow-200 text-sm text-gray-500 font-medium italic shadow-sm">
                "{dailyInsight}"
              </div>
              
              <div className="flex items-center gap-4 bg-gray-900 text-white px-5 py-2 rounded-full shadow-xl">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Balance</div>
                <div className={`font-mono font-bold text-lg ${balance <= 0 ? 'text-red-500' : 'text-peutic-yellow'}`}>
                    {Math.floor(balance)} mins
                </div>
                <button 
                    onClick={() => { setPaymentError(undefined); setShowPayment(true); }}
                    className="bg-gray-700 p-1.5 rounded-full hover:bg-gray-600 transition-colors"
                >
                    <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

              <button onClick={onLogout} className="text-gray-500 hover:text-black transition-colors">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
           {/* Sidebar */}
           <div className="w-full md:w-64 flex-shrink-0 space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100 text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                        <img src={user.avatar} alt="User" className="w-full h-full" />
                    </div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">Premium Member</p>
                    {user.subscriptionStatus === 'BANNED' && (
                      <p className="text-xs text-red-600 font-bold bg-red-100 p-1 rounded mb-2">ACCOUNT RESTRICTED</p>
                    )}
                    <button onClick={() => { setPaymentError(undefined); setShowPayment(true); }} className="w-full py-2 bg-peutic-yellow rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors">Add Funds</button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
                    {[
                        { id: 'hub', icon: LayoutDashboard, label: 'Wellness Hub' },
                        { id: 'history', icon: Clock, label: 'History' },
                        { id: 'settings', icon: Settings, label: 'Settings' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-colors ${activeTab === item.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-yellow-50'}`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-peutic-yellow' : 'text-gray-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </div>
           </div>

           {/* Content Area */}
           <div className="flex-1">
                {activeTab === 'hub' && (
                    <div className="space-y-8 animate-float" style={{animation: 'none'}}>
                        {/* Wellness Header Section */}
                        <div className="bg-white rounded-2xl border border-yellow-100 p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Hello, {user.name.split(' ')[0]}</h2>
                                    <p className="text-gray-500">How are you feeling right now?</p>
                                </div>
                                <div className="flex gap-2">
                                    {['Happy', 'Calm', 'Neutral', 'Anxious', 'Sad'].map((m: any) => (
                                        <button 
                                            key={m} 
                                            onClick={() => handleSaveMood(m)}
                                            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-yellow-100 flex items-center justify-center text-xl transition-all hover:scale-110"
                                            title={m}
                                        >
                                            {m === 'Happy' ? '😄' : m === 'Calm' ? '😌' : m === 'Neutral' ? '😐' : m === 'Anxious' ? '😰' : '😔'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setShowBreathing(true)}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Wind className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold">Breathe</span>
                                        <span className="text-xs opacity-70">Panic Relief Tool</span>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setShowJournal(!showJournal)}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold">Journal</span>
                                        <span className="text-xs opacity-70">Private Notes</span>
                                    </div>
                                </button>
                            </div>

                            {showJournal && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-float" style={{animation: 'none'}}>
                                    <textarea 
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none resize-none mb-2"
                                        placeholder="Write down your thoughts safely here..."
                                        value={journalContent}
                                        onChange={(e) => setJournalContent(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <button onClick={handleSaveJournal} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                                            <Save className="w-3 h-3" /> Save to Vault
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specialists Grid */}
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-peutic-yellow" /> Your Care Team</h2>
                                    <p className="text-gray-500">Available 24/7 for video sessions.</p>
                                </div>
                                <div className="relative w-full md:w-auto">
                                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search specialists..." 
                                        className="w-full md:w-64 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCompanions.map(companion => (
                                    <div key={companion.id} className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                        <div className="h-64 bg-gray-200 relative overflow-hidden">
                                            <img src={companion.imageUrl} alt={companion.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${companion.status === 'AVAILABLE' ? 'bg-green-500 text-white' : companion.status === 'OFFLINE' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                                                {companion.status}
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                <h3 className="font-bold text-xl text-white">{companion.name}</h3>
                                                <p className="text-sm text-gray-300 font-medium">{companion.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                                    <Star className="w-4 h-4 fill-current" /> {companion.rating}
                                                </div>
                                                <span className="text-xs text-gray-400">ID: {companion.replicaId.substring(0, 4)}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{companion.bio}</p>
                                            <button 
                                                onClick={() => handleConnectRequest(companion)}
                                                disabled={companion.status !== 'AVAILABLE' || user.subscriptionStatus === 'BANNED'}
                                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                                                    companion.status === 'AVAILABLE' && user.subscriptionStatus !== 'BANNED'
                                                    ? 'bg-black text-white hover:bg-peutic-yellow hover:text-black shadow-lg hover:shadow-yellow-200' 
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {companion.status === 'AVAILABLE' ? <><Video className="w-4 h-4" /> Connect Now</> : 'Unavailable'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'history' && (
                    <div className="bg-white rounded-2xl border border-yellow-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Transaction & Session History</h3>
                        </div>
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No transaction history found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                                        <tr>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Minutes</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{tx.description}</td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                                                <td className={`px-6 py-4 font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                  {tx.amount > 0 ? '+' : ''}{tx.amount} mins
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" /> {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'settings' && (
                     <div className="bg-white rounded-2xl border border-yellow-100 p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
                        <div className="space-y-6">
                             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive session summaries via email</p>
                                </div>
                                <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                             </div>
                             <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="font-bold text-red-600 mb-2">Delete Account</p>
                                <p className="text-sm text-gray-500 mb-4">Permanently remove your data and access.</p>
                                <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">Delete Account</button>
                             </div>
                        </div>
                    </div>
                )}
           </div>
        </div>
      </div>

      {/* Modals */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} initialError={paymentError} />}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
    </div>
  );
};

function Star(props: any) { return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }

export default Dashboard;
