
import React, { useState, useEffect, useRef } from 'react';
import { User, Companion, Transaction, MoodEntry, JournalEntry } from '../types';
import { 
  Video, CreditCard, Clock, Settings, LogOut, 
  LayoutDashboard, Plus, Search, Filter, X, Lock, CheckCircle, AlertTriangle, ShieldCheck, Heart, Calendar,
  Smile, PenTool, Wind, BookOpen, Save, Sparkles, Activity, Info, Flame, Trophy, Target, Hourglass, Coffee,
  Sun, Cloud, Umbrella, Music, Feather, Anchor, Gamepad2, RefreshCw, Play, Zap, Star, Ghost, Edit2, Camera, Droplets, Gift, Users
} from 'lucide-react';
import { generateDailyInsight } from '../services/geminiService';
import { Database, STABLE_AVATAR_POOL } from '../services/database';
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

// --- THE "INFINITY" AVATAR COMPONENT (DiceBear Fallback) ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        // If empty or too short, default to fallback immediately
        if (src && src.length > 10) { 
            setImgSrc(src);
        } else {
            useFallback();
        }
    }, [src]);

    const useFallback = () => {
        // DiceBear Lorelei style is friendly and high quality SVG
        setImgSrc(`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(alt)}&backgroundColor=FACC15`);
    };

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`${className} object-cover object-center`}
            onError={useFallback}
            loading="lazy"
        />
    );
};

// --- SOUNDSCAPE PLAYER ---
const SoundscapePlayer: React.FC = () => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const [track, setTrack] = useState('rain');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const TRACKS = {
        rain: "https://cdn.pixabay.com/download/audio/2022/07/04/audio_3259032b48.mp3",
        forest: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3",
        white: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_09a40c98f2.mp3",
        lofi: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
    };

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(TRACKS[track as keyof typeof TRACKS]);
            audioRef.current.loop = true;
        } else {
            const wasPlaying = !audioRef.current.paused;
            audioRef.current.src = TRACKS[track as keyof typeof TRACKS];
            if (wasPlaying) audioRef.current.play();
        }
        audioRef.current.volume = volume;
    }, [track, volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) { audioRef.current.pause(); } 
        else { audioRef.current.play().catch(e => console.log("Audio blocked")); }
        setPlaying(!playing);
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-yellow-500/90 backdrop-blur-md p-2 rounded-full border border-yellow-300 shadow-xl transition-all hover:bg-yellow-400 animate-in fade-in slide-in-from-bottom-10">
            <button onClick={togglePlay} className={`p-3 rounded-full transition-colors ${playing ? 'bg-black text-white' : 'bg-white/20 text-black'}`}>
                {playing ? <Music className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            {playing && (
                <div className="flex items-center gap-2 px-2 animate-in zoom-in fade-in duration-300 origin-left">
                    <select 
                        value={track} 
                        onChange={e => setTrack(e.target.value)}
                        className="bg-transparent text-xs font-bold text-black outline-none w-20 cursor-pointer"
                    >
                        <option value="rain">Rain</option>
                        <option value="forest">Nature</option>
                        <option value="white">Focus</option>
                        <option value="lofi">Lo-Fi</option>
                    </select>
                    <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-black/20 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                </div>
            )}
        </div>
    );
};

// --- WEATHER ENGINE ---
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
        const particleCount = type === 'confetti' ? 150 : 400; 
        
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
                if (type === 'confetti') { p.vy += 0.1; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); } 
                else { ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.length); ctx.stroke(); }
                if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; if (type === 'confetti') p.vy = Math.random() * 5 + 2; }
            });
            requestAnimationFrame(animate);
        };
        animate();
    }, [type]);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[50]" />;
};

// --- MINDFUL MATCH 3D ---
const MindfulMatchGame: React.FC<{ onWin?: () => void }> = ({ onWin }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<number[]>([]);
    const [won, setWon] = useState(false);
    const ICONS = [Sun, Heart, Music, Zap, Star, Anchor, Feather, Cloud];

    useEffect(() => { initGame(); }, []);

    const initGame = () => {
        const duplicated = [...ICONS, ...ICONS];
        const shuffled = duplicated.sort(() => Math.random() - 0.5).map((icon, i) => ({ id: i, icon }));
        setCards(shuffled); setFlipped([]); setSolved([]); setWon(false);
    };

    const handleCardClick = (index: number) => {
        if (flipped.length === 2 || solved.includes(index) || flipped.includes(index)) return;
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);
        if (newFlipped.length === 2) {
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
        <div className="bg-gradient-to-br from-yellow-50/50 to-white h-full flex flex-col rounded-2xl p-4 border border-yellow-100 overflow-hidden relative shadow-inner">
            <div className="flex justify-between items-center mb-2 z-10">
                <h3 className="font-black text-sm text-yellow-900 uppercase tracking-widest">Mindful Match</h3>
                <button onClick={initGame} className="p-1 hover:bg-yellow-100 rounded-full transition-colors"><RefreshCw className="w-4 h-4 text-yellow-600" /></button>
            </div>
            {won ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in">
                    <Trophy className="w-16 h-16 text-yellow-500 mb-2 animate-bounce" />
                    <p className="font-black text-2xl text-yellow-900">Zen Master!</p>
                    <button onClick={initGame} className="mt-4 bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">Replay</button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 h-full p-1 content-center">
                    {cards.map((card, i) => {
                        const isVisible = flipped.includes(i) || solved.includes(i);
                        const Icon = card.icon;
                        return (
                            <div key={i} className="aspect-square">
                                <button onClick={() => handleCardClick(i)} className={`w-full h-full rounded-lg flex items-center justify-center transition-all duration-300 ${isVisible ? 'bg-white border-2 border-yellow-400 shadow-lg' : 'bg-gray-900 shadow-md'}`}>
                                    {isVisible && <Icon className="w-6 h-6 text-yellow-500 animate-in zoom-in" />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- CLOUD HOP (Vertical Scroller with Tap Controls) ---
const CloudHopGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const playerRef = useRef({ x: 150, y: 300, vx: 0, vy: 0 });

    useEffect(() => {
        if (!gameStarted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const GRAVITY = 0.4;
        let platforms = [{x: 0, y: 380, w: 400, h: 40, type: 'ground'}];
        let req: number;
        
        // Seed platforms
        let py = 300;
        while (py > -2000) {
            platforms.push({ x: Math.random() * 300, y: py, w: 70, h: 15, type: 'cloud' });
            py -= 90;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') playerRef.current.vx = -4;
            if (e.key === 'ArrowRight') playerRef.current.vx = 4;
        };
        const handleKeyUp = () => { playerRef.current.vx = 0; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const drawCloud = (x: number, y: number, w: number, h: number) => {
             ctx.fillStyle = 'white';
             ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
             ctx.beginPath(); ctx.arc(x+10, y, 15, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(x+w-10, y, 15, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(x+w/2, y-5, 20, 0, Math.PI*2); ctx.fill();
        };

        const update = () => {
            const p = playerRef.current;
            p.x += p.vx;
            if (p.x < -20) p.x = 400; if (p.x > 400) p.x = -20;
            p.vy += GRAVITY; p.y += p.vy;

            if (p.y < 200) {
                p.y = 200;
                setScore(s => s + Math.floor(Math.abs(p.vy)));
                platforms.forEach(pl => {
                    pl.y += Math.abs(p.vy);
                    if (pl.y > 450) { pl.y = -20; pl.x = Math.random() * 340; }
                });
            }

            if (p.vy > 0) {
                platforms.forEach(pl => {
                    if (p.y + 20 > pl.y && p.y + 20 < pl.y + 40 && p.x + 20 > pl.x && p.x < pl.x + pl.w) {
                        p.vy = -10;
                    }
                });
            }

            if (p.y > 450) { setGameOver(true); setGameStarted(false); cancelAnimationFrame(req); return; }

            const grad = ctx.createLinearGradient(0,0,0,400); grad.addColorStop(0,'#38bdf8'); grad.addColorStop(1,'#bae6fd');
            ctx.fillStyle = grad; ctx.fillRect(0,0,400,400);
            
            // Stars
            ctx.fillStyle = 'white';
            for(let i=0; i<20; i++) ctx.fillRect(Math.random()*400, Math.random()*400, 2, 2);

            platforms.forEach(pl => {
                if(pl.type==='ground') { ctx.fillStyle='#4ade80'; ctx.fillRect(pl.x, pl.y, pl.w, pl.h); }
                else drawCloud(pl.x, pl.y, pl.w, pl.h);
            });

            // Player
            ctx.shadowBlur = 15; ctx.shadowColor = 'white';
            ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(p.x+15, p.y+15, 15, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'black'; 
            ctx.beginPath(); ctx.arc(p.x+10, p.y+12, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(p.x+20, p.y+12, 2, 0, Math.PI*2); ctx.fill();

            req = requestAnimationFrame(update);
        };
        update();

        return () => { 
            cancelAnimationFrame(req); 
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStarted]);

    const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return;
        // Simple tap logic: Left side go left, right side go right
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const rect = canvasRef.current.getBoundingClientRect();
        if (clientX - rect.left < rect.width / 2) playerRef.current.vx = -5;
        else playerRef.current.vx = 5;
    };
    
    const handleRelease = () => { playerRef.current.vx = 0; };

    return (
        <div 
            className="relative h-full w-full bg-sky-300 overflow-hidden rounded-2xl border-4 border-white shadow-inner cursor-pointer"
            onMouseDown={handleTap} onMouseUp={handleRelease}
            onTouchStart={handleTap} onTouchEnd={handleRelease}
        >
            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-black text-white text-lg z-10">{score}m</div>
            <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
            {(!gameStarted || gameOver) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <button onClick={() => { setGameStarted(true); setGameOver(false); setScore(0); playerRef.current = {x:150,y:300,vx:0,vy:0}; }} className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-black text-lg shadow-xl hover:scale-110 transition-transform flex items-center gap-2">
                        <Play className="w-5 h-5 fill-current" /> {gameOver ? 'Try Again' : 'Play'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ... (Breathing, PlayModal, ProfileModal, PaymentModal, GiftModal remain same) ...
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

const PaymentModal: React.FC<{ onClose: () => void; onSuccess: (amount: number, cost: number) => void; initialError?: string }> = ({ onClose, onSuccess, initialError }) => {
    const [amount, setAmount] = useState(20);
    const [isCustom, setIsCustom] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(initialError || null);
    
    const stripeRef = useRef<any>(null);
    const elementsRef = useRef<any>(null);
    const cardElementRef = useRef<any>(null);
    const mountNodeRef = useRef<HTMLDivElement>(null);
    const settings = Database.getSettings();
    const pricePerMin = settings.pricePerMinute;

    useEffect(() => {
        if (!window.Stripe) { setError("Stripe failed to load. Please refresh."); return; }
        if (!stripeRef.current) {
            stripeRef.current = window.Stripe(STRIPE_PUBLISHABLE_KEY);
            elementsRef.current = stripeRef.current.elements();
            const style = {
                base: { color: "#32325d", fontFamily: '"Manrope", sans-serif', fontSmoothing: "antialiased", fontSize: "16px", "::placeholder": { color: "#aab7c4" } },
                invalid: { color: "#fa755a", iconColor: "#fa755a" }
            };
            if (!cardElementRef.current) {
                cardElementRef.current = elementsRef.current.create("card", { style: style, hidePostalCode: true });
                setTimeout(() => { if (mountNodeRef.current) cardElementRef.current.mount(mountNodeRef.current); }, 100);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        if (!amount || amount <= 0) { setError("Please enter a valid amount."); setProcessing(false); return; }
        if (!stripeRef.current || !cardElementRef.current) { setError("Payment system not initialized."); setProcessing(false); return; }
        try {
            const result = await stripeRef.current.createToken(cardElementRef.current);
            if (result.error) { setError(result.error.message); setProcessing(false); } else {
                setTimeout(() => { setProcessing(false); const minutesAdded = Math.floor(amount / pricePerMin); onSuccess(minutesAdded, amount); }, 1500);
            }
        } catch (err: any) { setError(err.message || "Payment failed."); setProcessing(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600" /><span className="font-bold text-gray-700">Secure Checkout</span></div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <p className="text-gray-500 text-sm mb-4 font-medium">Select Amount to Add</p>
                        {!isCustom && <h2 className="text-5xl font-extrabold tracking-tight mb-6">${amount.toFixed(2)}</h2>}
                        <div className="flex justify-center gap-2 mb-6 flex-wrap">
                            {[20, 50, 100, 250].map((val) => (
                                <button key={val} type="button" onClick={() => { setAmount(val); setIsCustom(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!isCustom && amount === val ? 'bg-black text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>${val}</button>
                            ))}
                            <button type="button" onClick={() => { setIsCustom(true); setAmount(0); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isCustom ? 'bg-black text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Custom</button>
                        </div>
                        {isCustom && (
                            <div className="mb-6 animate-in fade-in zoom-in duration-300">
                                <div className="relative max-w-[180px] mx-auto">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
                                    <input type="number" min="1" step="1" value={amount === 0 ? '' : amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none text-2xl font-bold text-center" placeholder="0.00" autoFocus />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Adds approx. <span className="font-bold text-black">{Math.floor((amount || 0) / pricePerMin)} mins</span> of talk time.</p>
                    </div>
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><div ref={mountNodeRef} className="p-2" /></div>
                        <button type="submit" disabled={processing || !window.Stripe || (amount <= 0)} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${processing || (amount <= 0) ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-peutic-yellow text-black hover:bg-yellow-400 hover:scale-[1.02]'}`}>
                            {processing ? <span className="animate-pulse">Processing Securely...</span> : <><Lock className="w-5 h-5" /> Pay ${(amount || 0).toFixed(2)}</>}
                        </button>
                    </form>
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

// --- GIFT MODAL ---
const GiftModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [amount, setAmount] = useState(20);
    const [code, setCode] = useState<string | null>(null);

    const handleBuy = () => {
        const newCode = Database.createGiftCard(amount, 'currentUser');
        setCode(newCode);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X className="w-6 h-6 text-gray-400" /></button>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4"><Gift className="w-8 h-8 text-pink-600" /></div>
                <h2 className="text-2xl font-bold mb-2">Gift Wellness</h2>
                {!code ? (
                    <>
                        <p className="text-gray-500 mb-6">Send minutes to a friend.</p>
                        <div className="flex justify-center gap-2 mb-6">
                            {[20, 50, 100].map(a => (
                                <button key={a} onClick={() => setAmount(a)} className={`px-4 py-2 rounded-xl font-bold ${amount === a ? 'bg-black text-white' : 'bg-gray-100'}`}>{a}m</button>
                            ))}
                        </div>
                        <button onClick={handleBuy} className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold">Generate Gift Code</button>
                    </>
                ) : (
                    <div className="animate-in zoom-in">
                        <p className="text-green-600 font-bold mb-2">Gift Card Created!</p>
                        <div className="bg-gray-100 p-4 rounded-xl font-mono text-xl tracking-widest font-bold select-all">{code}</div>
                        <p className="text-xs text-gray-400 mt-2">Share this code with your friend.</p>
                    </div>
                )}
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
  const [showGift, setShowGift] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyInsight, setDailyInsight] = useState<string>('');
  
  const [dashboardUser, setDashboardUser] = useState(user);
  const [balance, setBalance] = useState(user.balance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loadingCompanions, setLoadingCompanions] = useState(true); 
  const [timeGreeting, setTimeGreeting] = useState('Hello');
  const [streak, setStreak] = useState(3);
  const [weeklyGoal, setWeeklyGoal] = useState(0);
  const [mood, setMood] = useState<'Happy'|'Calm'|'Neutral'|'Sad'|'Anxious' | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [showJournal, setShowJournal] = useState(false);

  const refreshData = () => {
    const dbUser = Database.getUser();
    if (dbUser) { setBalance(dbUser.balance); setDashboardUser(dbUser); }
    const txs = Database.getUserTransactions(user.id);
    setTransactions(txs);
    const thisWeekSessions = txs.filter(t => {
        const d = new Date(t.date);
        const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000 && t.amount < 0;
    });
    setWeeklyGoal(thisWeekSessions.length);
    setCompanions(Database.getCompanions());
  };
  
  useEffect(() => {
      const h = new Date().getHours();
      setTimeGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');
      refreshData();
      const interval = setInterval(refreshData, 5000);
      setTimeout(() => setLoadingCompanions(false), 1000);
      generateDailyInsight(user.name).then(setDailyInsight);
      return () => clearInterval(interval);
  }, [user.id]);

  const handlePaymentSuccess = (minutesAdded: number, cost: number) => {
      Database.topUpWallet(minutesAdded, cost);
      setBalance(prev => prev + minutesAdded);
      setShowPayment(false);
      setPaymentError(undefined);
      setWeather('confetti');
      setTimeout(() => setWeather(null), 5000);
  };

  const handleConnectRequest = (companion: Companion) => {
      if (balance <= 0) { 
          setPaymentError("Please add funds to connect."); 
          setShowPayment(true);
          return; 
      } 
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
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900 selection:bg-yellow-200 relative overflow-hidden">
      {/* NOISE TEXTURE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {weather && <WeatherEffect type={weather} />}
      <SoundscapePlayer />
      
      {/* Navbar */}
      <nav className="bg-[#FFFBEB]/80 backdrop-blur-xl border-b border-yellow-100 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20"><Heart className="fill-black w-6 h-6" /></div>
              <span className="font-black text-xl tracking-tight">Peutic</span>
          </div>
          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                  <Flame className="w-4 h-4 text-orange-500" /> <span className="text-xs font-bold text-gray-600">{streak} Day Streak</span>
              </div>
              <div className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full shadow-xl hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowPayment(true)}>
                  <span className="font-mono font-bold text-yellow-400">{Math.floor(balance)}m</span>
                  <Plus className="w-4 h-4" />
              </div>
              <button onClick={onLogout} className="p-2 hover:bg-yellow-100 rounded-full transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-10 relative z-10">
          {/* Sidebar */}
          <div className="w-full md:w-72 space-y-6">
              <div className="bg-[#FFFBEB] p-8 rounded-3xl text-center relative group shadow-sm border border-yellow-200">
                  <button onClick={() => setShowProfile(true)} className="absolute top-4 right-4 p-2 bg-yellow-100 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"><Edit2 className="w-3 h-3" /></button>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-br from-yellow-400 to-orange-300 shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                          <AvatarImage src={dashboardUser.avatar || ''} alt={dashboardUser.name} className="w-full h-full object-cover" />
                      </div>
                  </div>
                  <h3 className="font-black text-2xl">{dashboardUser.name}</h3>
                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-6">Premium Member</p>
                  
                  <div className="bg-white p-4 rounded-2xl text-left border border-yellow-100 shadow-inner">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>Weekly Goal</span><span>{weeklyGoal}/3</span></div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.min(100, (weeklyGoal / 3) * 100)}%` }}></div></div>
                  </div>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden p-2 space-y-1 shadow-sm border border-yellow-100">
                  {[{ id: 'hub', icon: LayoutDashboard, label: 'Wellness Hub' }, { id: 'history', icon: Clock, label: 'History' }, { id: 'settings', icon: Settings, label: 'Settings' }].map(item => (
                      <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-yellow-100'}`}>
                          <item.icon className="w-5 h-5" /> {item.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
              {activeTab === 'hub' && (
                  <div className="space-y-8 animate-in fade-in">
                      {/* Insight */}
                      <div className="bg-[#FFFBEB] border border-yellow-200 p-8 rounded-3xl relative overflow-hidden group shadow-sm">
                          <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-300 rounded-full blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity"></div>
                          <h2 className="text-3xl font-black mb-2 text-gray-900 relative z-10">Hello, {dashboardUser.name.split(' ')[0]}.</h2>
                          <p className="text-gray-600 text-lg relative z-10 max-w-xl">"{dailyInsight}"</p>
                      </div>

                      {/* Games & Tools */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           <div className="lg:col-span-2 bg-[#FFFBEB] border border-yellow-200 p-1 rounded-3xl flex gap-1 h-64 shadow-sm">
                                <div className="flex-1 relative rounded-2xl overflow-hidden group border border-yellow-100">
                                    <MindfulMatchGame />
                                </div>
                                <div className="flex-1 relative rounded-2xl overflow-hidden group border border-yellow-100">
                                    <CloudHopGame />
                                </div>
                           </div>
                           <div className="space-y-4">
                               <button onClick={() => setShowBreathing(true)} className="w-full h-30 bg-[#FFFBEB] border border-yellow-200 p-6 rounded-3xl flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer group hover:shadow-md">
                                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-sm"><Wind className="w-6 h-6 text-blue-600" /></div>
                                   <div className="text-left">
                                       <h4 className="font-bold text-lg text-gray-900">Breathe</h4>
                                       <p className="text-xs text-gray-500">2 min reset</p>
                                   </div>
                               </button>
                               <button onClick={() => setShowGift(true)} className="w-full h-30 bg-[#FFFBEB] border border-yellow-200 p-6 rounded-3xl flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer group hover:shadow-md">
                                   <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors shadow-sm"><Gift className="w-6 h-6 text-pink-600" /></div>
                                   <div className="text-left">
                                       <h4 className="font-bold text-lg text-gray-900">Gift</h4>
                                       <p className="text-xs text-gray-500">Share joy</p>
                                   </div>
                               </button>
                           </div>
                      </div>

                      {/* Specialists */}
                      <div>
                          <div className="flex justify-between items-end mb-6 px-2">
                              <h3 className="font-black text-2xl text-gray-900">Your Care Team</h3>
                              <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-gray-200">Live 24/7</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {loadingCompanions ? [1,2,3].map(i => <div key={i} className="h-72 bg-gray-200/50 rounded-3xl animate-pulse"></div>) : (
                                  filteredCompanions.map(c => (
                                      <div key={c.id} onClick={() => handleConnectRequest(c)} className="bg-[#FFFBEB] border border-yellow-200 p-4 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                                          <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-gray-100 shadow-inner">
                                              <AvatarImage src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md ${c.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-500'}`}>{c.status}</div>
                                          </div>
                                          <div className="flex justify-between items-center px-2">
                                              <div>
                                                  <h4 className="font-bold text-lg text-gray-900">{c.name}</h4>
                                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.specialty}</p>
                                              </div>
                                              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-colors shadow-lg">
                                                  <Video className="w-5 h-5" />
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              )}
              {activeTab === 'history' && <div className="text-center p-20 text-gray-400 font-bold text-xl">Transaction History</div>}
              {activeTab === 'settings' && <div className="text-center p-20 text-gray-400 font-bold text-xl">Settings Panel</div>}
          </div>
      </div>
      
      {/* Modals */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} initialError={paymentError} />}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
      {showProfile && <ProfileModal user={dashboardUser} onClose={() => setShowProfile(false)} onUpdate={refreshData} />}
      {showPlay && <PlayModal onClose={() => setShowPlay(false)} />}
      {showGift && <GiftModal onClose={() => setShowGift(false)} />}
    </div>
  );
};

export default Dashboard;
