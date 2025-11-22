import React, { useState, useEffect, useRef } from 'react';
import { User, Companion, Transaction, MoodEntry, JournalEntry } from '../types';
import { 
  Video, CreditCard, Clock, Settings, LogOut, 
  LayoutDashboard, Plus, Search, Filter, X, Lock, CheckCircle, AlertTriangle, ShieldCheck, Heart,
  Smile, Wind, BookOpen, Save, Sparkles, Activity, Info, Flame, Trophy, Target, Gamepad2, RefreshCw, Play, Edit2
} from 'lucide-react';
import { generateDailyInsight } from '../services/geminiService';
import { Database } from '../services/database';

// --- ROBUST AVATAR ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    useEffect(() => { setImgSrc(src); }, [src]);
    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`${className} object-cover object-center`}
            onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=FACC15&color=000&size=512&bold=true`)}
            loading="lazy"
        />
    );
};

// --- BREATHING (120s + Audio + Cooldown) ---
const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [text, setText] = useState("Inhale");
    const [timeLeft, setTimeLeft] = useState(120); // 120 Seconds
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Audio
        audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-impulse-30032.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log("Autoplay blocked", e));

        const steps = [{ text: "Inhale", delay: 4000 }, { text: "Hold", delay: 4000 }, { text: "Exhale", delay: 4000 }, { text: "Hold", delay: 4000 }];
        let stepIdx = 0;
        
        const loop = setInterval(() => {
            setText(steps[stepIdx].text);
            stepIdx = (stepIdx + 1) % steps.length;
        }, 4000);

        const timer = setInterval(() => {
            setTimeLeft(p => {
                if (p <= 1) {
                    Database.setBreathingCooldown(Date.now() + 5 * 60 * 1000); // 5 Min Cooldown
                    onClose();
                    return 0;
                }
                return p - 1;
            });
        }, 1000);

        return () => {
            clearInterval(loop);
            clearInterval(timer);
            if (audioRef.current) audioRef.current.pause();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center flex-col">
            <div className="relative w-64 h-64 flex items-center justify-center">
                 <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
                 <div className="absolute inset-4 bg-yellow-500/40 rounded-full animate-pulse"></div>
                 <h2 className="relative z-10 text-4xl font-bold text-white">{text}</h2>
            </div>
            <p className="text-gray-400 mt-8">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</p>
            <button onClick={onClose} className="mt-8 text-white underline">End Session</button>
        </div>
    );
};

// --- GAME COMPONENTS (Placeholders for brevity, assuming logic exists in full file) ---
const MindfulMatchGame = () => <div className="h-full w-full bg-yellow-50 flex items-center justify-center rounded-xl">Matching Game Active</div>;
const CloudHopGame = () => <div className="h-full w-full bg-sky-100 flex items-center justify-center rounded-xl">Cloud Hop Active</div>;

// --- DASHBOARD ---
const Dashboard: React.FC<any> = ({ user, onLogout, onStartSession }) => {
  const [activeTab, setActiveTab] = useState('hub');
  const [showBreathing, setShowBreathing] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const [activeGame, setActiveGame] = useState<'mindful'|'cloud'>('cloud'); // Default to Cloud to avoid blank
  const [balance, setBalance] = useState(user.balance);
  const [companions, setCompanions] = useState<any[]>([]);

  useEffect(() => {
      const refresh = () => {
          const u = Database.getUser();
          if (u) setBalance(u.balance);
          setCompanions(Database.getCompanions());
      };
      refresh();
      const i = setInterval(refresh, 3000);
      return () => clearInterval(i);
  }, []);

  const handleBreathClick = () => {
      const cd = Database.getBreathingCooldown();
      if (cd && cd > Date.now()) {
          alert(`Cooldown active. Wait ${Math.ceil((cd - Date.now())/60000)} mins.`);
      } else {
          setShowBreathing(true);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBEB] to-[#FFF1F2]">
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-30 border-b border-yellow-100">
            <span className="font-bold text-xl flex items-center gap-2"><Heart className="fill-black"/> Peutic</span>
            <div className="flex items-center gap-4">
                <div className="bg-black text-white px-4 py-1 rounded-full font-mono text-yellow-400 font-bold">{balance}m</div>
                <button onClick={onLogout}><LogOut className="w-5 h-5"/></button>
            </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-yellow-100 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-4 border-white shadow-lg">
                        <AvatarImage src={user.avatar || ''} alt={user.name} className="w-full h-full" />
                    </div>
                    <h3 className="font-bold">{user.name}</h3>
                    <button className="text-xs bg-gray-100 px-3 py-1 rounded-full mt-2 hover:bg-gray-200">Edit Profile</button>
                </div>
                <div className="bg-white rounded-xl overflow-hidden">
                    {['hub', 'history', 'settings'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`w-full p-4 text-left font-bold capitalize ${activeTab === t ? 'bg-black text-white' : 'text-gray-500 hover:bg-yellow-50'}`}>{t}</button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                {activeTab === 'hub' && (
                    <div className="space-y-6">
                        {/* Wellness Tools */}
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={handleBreathClick} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-left hover:shadow-md transition-all">
                                <Wind className="w-6 h-6 text-blue-500 mb-2" />
                                <div className="font-bold text-blue-900">Breathe</div>
                            </button>
                            <button onClick={() => setShowPlay(true)} className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-left hover:shadow-md transition-all">
                                <Gamepad2 className="w-6 h-6 text-yellow-600 mb-2" />
                                <div className="font-bold text-yellow-900">Play</div>
                            </button>
                            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-left">
                                <BookOpen className="w-6 h-6 text-purple-500 mb-2" />
                                <div className="font-bold text-purple-900">Journal</div>
                            </div>
                        </div>

                        {/* Specialist Grid */}
                        <h3 className="font-bold text-xl mt-8 mb-4">Available Specialists</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {companions.map(c => (
                                <div key={c.id} className="bg-white p-3 rounded-2xl border border-yellow-100 hover:shadow-xl transition-all cursor-pointer group" onClick={() => onStartSession(c)}>
                                    <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-gray-100">
                                        <AvatarImage src={c.imageUrl} alt={c.name} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold text-white ${c.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-400'}`}>{c.status}</div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div><div className="font-bold">{c.name}</div><div className="text-xs text-gray-500">{c.specialty}</div></div>
                                        <div className="bg-black text-white p-2 rounded-full"><Video className="w-4 h-4" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* GAME MODAL */}
        {showPlay && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-[#FFFBEB] w-full max-w-3xl h-[600px] rounded-3xl p-4 relative flex flex-col">
                    <button onClick={() => setShowPlay(false)} className="absolute top-4 right-4 p-2 bg-white rounded-full"><X className="w-4 h-4"/></button>
                    <div className="flex justify-center gap-4 mb-4">
                        <button onClick={() => setActiveGame('cloud')} className={`px-4 py-2 rounded-full font-bold ${activeGame === 'cloud' ? 'bg-sky-500 text-white' : 'bg-white'}`}>Cloud Hop</button>
                        <button onClick={() => setActiveGame('mindful')} className={`px-4 py-2 rounded-full font-bold ${activeGame === 'mindful' ? 'bg-yellow-500 text-black' : 'bg-white'}`}>Mindful Match</button>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-gray-200">
                        {activeGame === 'cloud' ? <CloudHopGame /> : <MindfulMatchGame />}
                    </div>
                </div>
            </div>
        )}

        {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
    </div>
  );
};

export default Dashboard;