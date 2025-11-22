
import React, { useState, useEffect, useRef } from 'react';
import { User, Companion, Transaction, MoodEntry, JournalEntry } from '../types';
import { 
  Video, CreditCard, Clock, Settings, LogOut, 
  LayoutDashboard, Plus, Search, Filter, X, Lock, CheckCircle, AlertTriangle, ShieldCheck, Heart, Calendar,
  Smile, PenTool, Wind, BookOpen, Save, Sparkles, Activity, Info, Flame, Trophy, Target, Hourglass, Coffee,
  Sun, Cloud, Umbrella, Music, Feather, Anchor, Gamepad2, RefreshCw, Play, Zap, Star, Ghost, Edit2, Camera, Droplets
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

declare global {
  interface Window {
    Stripe?: any;
  }
}

// --- ROBUST AVATAR COMPONENT ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    useEffect(() => { setImgSrc(src); }, [src]);
    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`${className} object-cover object-center`}
            onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=FACC15&color=000&size=512&bold=true&font-size=0.4`)}
            loading="lazy"
        />
    );
};

// --- WEATHER EFFECTS ENGINE (Fullscreen) ---
const WeatherEffect: React.FC<{ type: 'confetti' | 'rain' }> = ({ type }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles: any[] = [];
        const particleCount = type === 'confetti' ? 150 : 300; 
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                vx: type === 'confetti' ? (Math.random() - 0.5) * 10 : 0,
                vy: type === 'confetti' ? Math.random() * 5 + 2 : Math.random() * 15 + 10, 
                color: type === 'confetti' 
                    ? ['#FACC15', '#FFD700', '#FF0000', '#00FF00', '#0000FF'][Math.floor(Math.random() * 5)]
                    : '#60A5FA', 
                size: type === 'confetti' ? Math.random() * 8 + 4 : Math.random() * 2 + 1,
                length: type === 'rain' ? Math.random() * 20 + 10 : 0
            });
        }
        
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (type === 'confetti') {
                    p.vy += 0.1; 
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                } else {
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.size;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + p.length);
                    ctx.stroke();
                }

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    if (type === 'confetti') p.vy = Math.random() * 5 + 2;
                }
            });
            requestAnimationFrame(animate);
        };
        animate();
    }, [type]);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};

// --- MINDFUL MATCH (Fixed Layout) ---
const MindfulMatchGame: React.FC<{ onWin?: () => void }> = ({ onWin }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);
    const ICONS = [Sun, Heart, Music, Zap, Star, Anchor, Feather, Cloud];

    useEffect(() => { initGame(); }, []);

    const initGame = () => {
        const duplicated = [...ICONS, ...ICONS];
        const shuffled = duplicated.sort(() => Math.random() - 0.5).map((icon, i) => ({ id: i, icon }));
        setCards(shuffled); setFlipped([]); setSolved([]); setMoves(0); setWon(false);
    };

    const handleCardClick = (index: number) => {
        if (flipped.length === 2 || solved.includes(index) || flipped.includes(index)) return;
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            if (cards[newFlipped[0]].icon === cards[newFlipped[1]].icon) {
                setSolved([...solved, newFlipped[0], newFlipped[1]]);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    useEffect(() => { if (cards.length > 0 && solved.length === cards.length) { setWon(true); onWin?.(); } }, [solved]);

    return (
        <div className="bg-white/50 h-full flex flex-col rounded-2xl p-4 border border-yellow-100 overflow-hidden relative">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm text-gray-700">Mindful Match</h3>
                <button onClick={initGame}><RefreshCw className="w-4 h-4 text-gray-400 hover:text-black" /></button>
            </div>
            {won ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                    <p className="font-bold text-lg">Cleared!</p>
                    <button onClick={initGame} className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm">Replay</button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 h-[calc(100%-30px)] overflow-y-auto p-1 content-start">
                    {cards.map((card, i) => {
                        const isVisible = flipped.includes(i) || solved.includes(i);
                        const Icon = card.icon;
                        return (
                            <button key={i} onClick={() => handleCardClick(i)} className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${isVisible ? 'bg-white shadow-md border-2 border-yellow-400' : 'bg-gray-900'}`}>
                                {isVisible && <Icon className="w-5 h-5 text-yellow-500 animate-in zoom-in" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- CLOUD HOP (Vertical Scroller) ---
const CloudHopGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (!gameStarted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const GRAVITY = 0.4; const JUMP_FORCE = -9;
        let player = { x: 150, y: 300, vx: 0, vy: 0 };
        let platforms = [{x: 0, y: 380, w: 400, type: 'ground'}];
        let req: number;
        let keys: any = {};
        let scoreVal = 0;

        let py = 300;
        while (py > -2000) {
            platforms.push({ x: Math.random() * 300, y: py, w: 60, type: 'cloud' });
            py -= 80;
        }

        const keyDown = (e: KeyboardEvent) => keys[e.code] = true;
        const keyUp = (e: KeyboardEvent) => keys[e.code] = false;
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);

        const update = () => {
            if (keys['ArrowLeft']) player.vx = -3;
            else if (keys['ArrowRight']) player.vx = 3;
            else player.vx *= 0.8;

            player.x += player.vx;
            if (player.x < -20) player.x = 400;
            if (player.x > 400) player.x = -20;

            player.vy += GRAVITY;
            player.y += player.vy;

            if (player.y < 200) {
                player.y = 200;
                scoreVal += Math.floor(Math.abs(player.vy));
                setScore(scoreVal);
                platforms.forEach(p => {
                    p.y += Math.abs(player.vy);
                    if (p.y > 400) { p.y = -20; p.x = Math.random() * 340; }
                });
            }

            if (player.vy > 0) {
                platforms.forEach(p => {
                    if (player.y + 20 > p.y && player.y + 20 < p.y + 20 && player.x + 20 > p.x && player.x < p.x + p.w) {
                        player.vy = JUMP_FORCE;
                    }
                });
            }

            if (player.y > 400) {
                setGameOver(true);
                setGameStarted(false);
                cancelAnimationFrame(req);
                return;
            }

            ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,400,400);
            ctx.fillStyle = '#FFF';
            platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, 10));
            ctx.fillStyle = '#FFD700';
            ctx.beginPath(); ctx.arc(player.x+10, player.y+10, 10, 0, Math.PI*2); ctx.fill();

            req = requestAnimationFrame(update);
        };
        update();
        return () => { cancelAnimationFrame(req); window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp); };
    }, [gameStarted]);

    return (
        <div className="relative h-full w-full bg-sky-300 overflow-hidden rounded-2xl border-4 border-white shadow-inner">
            <div className="absolute top-2 right-2 bg-white/50 px-2 rounded font-black">{score}</div>
            <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
            {(!gameStarted || gameOver) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <button onClick={() => { setGameStarted(true); setGameOver(false); setScore(0); }} className="bg-yellow-400 px-6 py-2 rounded-xl font-bold shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1">
                        {gameOver ? 'Try Again' : 'Start Hop'}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- BREATHING MODAL (120s + Audio + 5m Cooldown) ---
const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [text, setText] = useState("Inhale");
    const [timeLeft, setTimeLeft] = useState(120); 
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-impulse-30032.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log("Audio blocked", e));

        const steps = [{ text: "Inhale", delay: 4000 }, { text: "Hold", delay: 4000 }, { text: "Exhale", delay: 4000 }, { text: "Hold", delay: 4000 }];
        let stepIdx = 0;
        
        const loop = setInterval(() => {
            setText(steps[stepIdx].text);
            stepIdx = (stepIdx + 1) % steps.length;
        }, 4000);
        
        const timer = setInterval(() => {
            setTimeLeft(p => {
                if (p <= 1) {
                    Database.setBreathingCooldown(Date.now() + 5 * 60 * 1000); 
                    onClose();
                    return 0;
                }
                return p - 1;
            });
        }, 1000);
        
        return () => { 
            clearInterval(loop); 
            clearInterval(timer);
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="relative w-full max-w-md aspect-square flex items-center justify-center flex-col">
                <button onClick={onClose} className="absolute top-0 right-0 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
                <div className="absolute inset-0 bg-peutic-yellow/20 rounded-full animate-breathe"></div>
                <div className="absolute inset-12 bg-peutic-yellow/40 rounded-full animate-breathe" style={{ animationDelay: '1s' }}></div>
                <div className="relative z-10 text-center text-white">
                    <h2 className="text-4xl font-bold mb-2">{text}</h2>
                    <p className="text-white/60 mb-4">Listen to the sound...</p>
                    <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-mono">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                </div>
             </div>
        </div>
    );
};

// --- PLAY MODAL (Fixed Blank Page) ---
const PlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeGame, setActiveGame] = useState<'mindful' | 'cloud'>('cloud'); 
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFBEB] w-full max-w-3xl h-[600px] rounded-3xl p-6 shadow-2xl relative flex flex-col border-4 border-white">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveGame('mindful')} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeGame === 'mindful' ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>Mindful Match</button>
                        <button onClick={() => setActiveGame('cloud')} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeGame === 'cloud' ? 'bg-sky-400 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>Cloud Hop</button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-yellow-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-hidden rounded-2xl bg-white shadow-inner border border-yellow-100 relative">
                    {activeGame === 'mindful' ? <MindfulMatchGame /> : <CloudHopGame />}
                </div>
            </div>
        </div>
    );
};

// --- PROFILE MODAL ---
const ProfileModal: React.FC<{ user: User; onClose: () => void; onUpdate: () => void }> = ({ user, onClose, onUpdate }) => {
    const [url, setUrl] = useState(user.avatar || '');
    const save = () => {
        if (url) {
            const u = Database.getUser();
            if (u) { u.avatar = url; Database.updateUser(u); onUpdate(); onClose(); }
        }
    };
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                <h3 className="font-bold text-lg mb-4">Update Profile Picture</h3>
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-400">
                    <AvatarImage src={url} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <input className="w-full p-2 border rounded mb-4" placeholder="Image URL..." value={url} onChange={e => setUrl(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 border rounded font-bold">Cancel</button>
                    <button onClick={save} className="flex-1 py-2 bg-black text-white rounded font-bold">Save</button>
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD MAIN ---
const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onStartSession }) => {
  const [weather, setWeather] = useState<'confetti' | 'rain' | null>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'history' | 'settings'>('hub');
  const [showBreathing, setShowBreathing] = useState(false);
  const [showPlay, setShowPlay] = useState(false); 
  const [showQueue, setShowQueue] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingCompanion, setPendingCompanion] = useState<Companion | null>(null);
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyInsight, setDailyInsight] = useState<string>('');
  
  // State management
  const [dashboardUser, setDashboardUser] = useState(user);
  const [balance, setBalance] = useState(user.balance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loadingCompanions, setLoadingCompanions] = useState(true); 
  const [timeGreeting, setTimeGreeting] = useState('Hello');
  const [mood, setMood] = useState<'Happy'|'Calm'|'Neutral'|'Sad'|'Anxious' | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  const [streak, setStreak] = useState(3);
  const [weeklyGoal, setWeeklyGoal] = useState(0);

  const refreshData = () => {
    const dbUser = Database.getUser();
    if (dbUser) {
        setBalance(dbUser.balance);
        setDashboardUser(dbUser);
    }
    const txs = Database.getUserTransactions(user.id);
    setTransactions(txs);
    const thisWeekSessions = txs.filter(t => {
        const d = new Date(t.date);
        const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000 && t.amount < 0;
    });
    setWeeklyGoal(thisWeekSessions.length);
    // Lightweight check, always refresh companions to ensure status is up to date
    setCompanions(Database.getCompanions());
  };
  
  useEffect(() => {
      const h = new Date().getHours();
      setTimeGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');
      
      refreshData();
      const interval = setInterval(refreshData, 5000);
      
      setTimeout(() => { 
          setCompanions(Database.getCompanions()); 
          setLoadingCompanions(false); 
      }, 1500);
      
      generateDailyInsight(user.name).then(setDailyInsight);
      return () => clearInterval(interval);
  }, [user.id]);

  const handlePaymentSuccess = (minutesAdded: number, cost: number) => {
      Database.topUpWallet(minutesAdded, cost);
      setBalance(prev => prev + minutesAdded);
      setPaymentError(undefined);
      setWeather('confetti');
      setTimeout(() => setWeather(null), 5000);
  };

  const handleConnectRequest = (companion: Companion) => {
      if (balance <= 0) { setPaymentError("You need to add credits to start a session."); return; } 
      onStartSession(companion);
  };

  const handleSaveMood = (m: 'Happy'|'Calm'|'Neutral'|'Sad'|'Anxious') => {
      const entry: MoodEntry = { id: `mood_${Date.now()}`, userId: user.id, date: new Date().toISOString(), mood: m };
      Database.saveMood(entry);
      setMood(null); setStreak(s => s + 1);
      if (m === 'Happy' || m === 'Calm') { setWeather('confetti'); setTimeout(() => setWeather(null), 5000); }
      else if (m === 'Sad' || m === 'Anxious') { setWeather('rain'); setTimeout(() => setWeather(null), 5000); }
  };

  const handleSaveJournal = () => {
      if (!journalContent.trim()) return;
      const entry: JournalEntry = { id: `jour_${Date.now()}`, userId: user.id, date: new Date().toISOString(), content: journalContent };
      Database.saveJournal(entry);
      setJournalContent(''); setShowJournal(false);
  };

  const startBreathing = () => {
      const cooldown = Database.getBreathingCooldown();
      if (cooldown && cooldown > Date.now()) {
          alert(`Please wait ${Math.ceil((cooldown - Date.now()) / 60000)} minutes before next session.`);
          return;
      }
      setShowBreathing(true);
  };

  const filteredCompanions = companions.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBEB] to-[#FFF1F2] font-sans text-gray-900 selection:bg-yellow-200 overflow-hidden">
      {weather && <WeatherEffect type={weather} />}
      
      <nav className="bg-white/80 backdrop-blur-md border-b border-yellow-100 sticky top-0 z-30 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl"><Heart className="fill-black" /> Peutic</div>
          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  <Flame className="w-4 h-4 text-orange-500" /> <span className="text-xs font-bold text-orange-700">{streak} Day Streak</span>
              </div>
              <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-lg">
                  <span className="font-mono font-bold text-yellow-400">{Math.floor(balance)}m</span>
                  <button className="bg-gray-700 p-1 rounded-full hover:bg-gray-600"><Plus className="w-3 h-3" /></button>
              </div>
              <button onClick={onLogout}><LogOut className="w-5 h-5 text-gray-500 hover:text-black" /></button>
          </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-100 text-center relative group">
                  <button onClick={() => setShowProfile(true)} className="absolute top-2 right-2 p-1.5 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-100"><Edit2 className="w-3 h-3" /></button>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <AvatarImage src={dashboardUser.avatar || ''} alt={dashboardUser.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-xl">{dashboardUser.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Premium Member</p>
                  <div className="bg-gray-50 p-3 rounded-xl text-left">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>Weekly Goal</span><span>{weeklyGoal}/3</span></div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.min(100, (weeklyGoal / 3) * 100)}%` }}></div></div>
                      <p className="text-[10px] text-gray-400 mt-1 text-center">{3 - weeklyGoal > 0 ? `${3 - weeklyGoal} sessions to go!` : 'Goal Met! 🎉'}</p>
                  </div>
              </div>
              <div className="bg-white rounded-3xl overflow-hidden border border-yellow-100">
                  {[{ id: 'hub', icon: LayoutDashboard, label: 'Wellness Hub' }, { id: 'history', icon: Clock, label: 'History' }, { id: 'settings', icon: Settings, label: 'Settings' }].map(item => (
                      <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 p-4 font-bold transition-colors ${activeTab === item.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-yellow-50'}`}>
                          <item.icon className="w-5 h-5" /> {item.label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex-1">
              {activeTab === 'hub' && (
                  <div className="space-y-8 animate-in fade-in">
                      <div className="bg-white p-6 rounded-3xl border border-yellow-100 shadow-sm relative overflow-hidden">
                          <div className="relative z-10">
                              <h2 className="text-2xl font-bold mb-2">{timeGreeting}, {dashboardUser.name.split(' ')[0]}</h2>
                              <p className="text-gray-500 italic mb-6 text-sm">"{dailyInsight}"</p>
                              <p className="text-xs font-bold text-gray-400 uppercase mb-3">How are you feeling?</p>
                              <div className="flex gap-3">
                                  {['Happy', 'Calm', 'Neutral', 'Anxious', 'Sad'].map(m => (
                                      <button key={m} onClick={() => handleSaveMood(m as any)} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-yellow-100 flex items-center justify-center text-xl transition-all hover:scale-110" title={m}>
                                          {m === 'Happy' ? '😄' : m === 'Calm' ? '😌' : m === 'Neutral' ? '😐' : m === 'Anxious' ? '😰' : '😔'}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button onClick={startBreathing} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 hover:shadow-md transition-all text-left group"><div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform"><Wind className="w-5 h-5 text-blue-500" /></div><div className="text-left hidden sm:block"><span className="block font-bold text-sm">Breathe</span><span className="text-xs opacity-70">Panic Relief</span></div></button>
                          <button onClick={() => setShowJournal(!showJournal)} className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100 group"><div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen className="w-5 h-5" /></div><div className="text-left hidden sm:block"><span className="block font-bold text-sm">Journal</span><span className="text-xs opacity-70">Private Notes</span></div></button>
                          <button onClick={() => setShowPlay(true)} className="flex items-center gap-3 p-4 rounded-xl bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors border border-yellow-200 group"><div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform"><Gamepad2 className="w-5 h-5" /></div><div className="text-left hidden sm:block"><span className="block font-bold text-sm">Play</span><span className="text-xs opacity-70">Games</span></div></button>
                      </div>
                      {showJournal && (<div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in zoom-in"><textarea className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none resize-none mb-2" placeholder="Write down your thoughts safely here..." value={journalContent} onChange={(e) => setJournalContent(e.target.value)}></textarea><div className="flex justify-end"><button onClick={handleSaveJournal} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"><Save className="w-3 h-3" /> Save to Vault</button></div></div>)}

                      <div>
                          <div className="flex justify-between items-end mb-4"><h3 className="font-bold text-lg">Your Care Team</h3><div className="text-xs text-gray-500">Available 24/7</div></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {loadingCompanions ? (<div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>) : (
                                  filteredCompanions.map(companion => (
                                      <div key={companion.id} className="bg-white p-3 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group cursor-pointer" onClick={() => handleConnectRequest(companion)}>
                                          <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                                              <AvatarImage src={companion.imageUrl} alt={companion.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                              <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold text-white ${companion.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-400'}`}>{companion.status}</div>
                                          </div>
                                          <div className="flex justify-between items-center"><div><h4 className="font-bold">{companion.name}</h4><p className="text-xs text-gray-500">{companion.specialty}</p></div><button className="bg-black text-white p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-colors"><Video className="w-4 h-4" /></button></div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              )}
              {activeTab === 'history' && <div className="text-center p-10 text-gray-500">Transaction History</div>}
              {activeTab === 'settings' && <div className="text-center p-10 text-gray-500">Account Settings</div>}
          </div>
      </div>
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
      {showProfile && <ProfileModal user={dashboardUser} onClose={() => setShowProfile(false)} onUpdate={refreshData} />}
      {showPlay && <PlayModal onClose={() => setShowPlay(false)} />}
    </div>
  );
};

export default Dashboard;
