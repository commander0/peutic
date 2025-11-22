
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

// Define window.Stripe type for TypeScript
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
            className={className} 
            onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=FACC15&color=000&size=512&bold=true`)}
            loading="lazy"
        />
    );
};

// --- WEATHER EFFECTS ENGINE (Confetti + Rain) ---
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
        const particleCount = type === 'confetti' ? 150 : 300; // Dazzling density
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                vx: type === 'confetti' ? (Math.random() - 0.5) * 10 : 0,
                vy: type === 'confetti' ? Math.random() * 5 + 2 : Math.random() * 10 + 10, // Rain falls fast
                color: type === 'confetti' 
                    ? ['#FACC15', '#FFD700', '#FF0000', '#00FF00', '#0000FF'][Math.floor(Math.random() * 5)]
                    : '#60A5FA', // Rain color
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
                    p.vy += 0.1; // Gravity
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

                // Reset if off screen
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

// --- MINDFUL MATCH GAME COMPONENT ---
const MindfulMatchGame: React.FC<{ onWin?: () => void }> = ({ onWin }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);

    const ICONS = [Sun, Heart, Smile, Music, Cloud, Coffee, Anchor, Feather];

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        const duplicated = [...ICONS, ...ICONS];
        const shuffled = duplicated
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({ id: index, icon, isFlipped: false }));
        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setWon(false);
    };

    const handleCardClick = (index: number) => {
        if (flipped.length === 2 || solved.includes(index) || flipped.includes(index)) return;
        
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);
        
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const firstCard = cards[newFlipped[0]];
            const secondCard = cards[newFlipped[1]];
            
            if (firstCard.icon === secondCard.icon) {
                setSolved([...solved, newFlipped[0], newFlipped[1]]);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    useEffect(() => {
        if (cards.length > 0 && solved.length === cards.length) {
            setWon(true);
            if (onWin) onWin();
        }
    }, [solved, cards, onWin]);

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 border border-yellow-100 h-full flex flex-col shadow-inner overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500"/> Mindful Match</h3>
                    <p className="text-xs text-gray-500">Find the pairs to focus your mind.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold bg-white border border-yellow-100 px-3 py-1 rounded-full text-yellow-800 shadow-sm">Moves: {moves}</span>
                    <button onClick={initGame} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"><RefreshCw className="w-4 h-4" /></button>
                </div>
            </div>

            {won ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200">
                        <Trophy className="w-12 h-12 text-yellow-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">Focus Complete!</h3>
                    <p className="text-gray-500 mb-8">You cleared your mind in {moves} moves.</p>
                    <button onClick={initGame} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 shadow-xl hover:scale-105 transition-transform">Play Again</button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3 sm:gap-4 flex-1 content-center max-w-md mx-auto w-full overflow-y-auto p-1">
                    {cards.map((card, index) => {
                        const isVisible = flipped.includes(index) || solved.includes(index);
                        const Icon = card.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleCardClick(index)}
                                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-500 transform preserve-3d ${
                                    isVisible 
                                    ? 'bg-white border-2 border-peutic-yellow shadow-md rotate-y-180' 
                                    : 'bg-gray-900 hover:bg-gray-800 shadow-lg'
                                }`}
                                style={{ perspective: '1000px' }}
                            >
                                {isVisible ? (
                                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-peutic-yellow animate-in fade-in zoom-in duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- ADVANCED CLOUD HOP GAME COMPONENT ---
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

        // Constants
        const GRAVITY = 0.4;
        const JUMP_FORCE = -11;
        const MOVE_SPEED = 4;
        
        // State
        let player = { x: canvas.width / 2, y: canvas.height - 100, width: 30, height: 30, vx: 0, vy: 0 };
        let platforms: any[] = [];
        let particles: any[] = [];
        let cameraY = 0;
        let scoreValue = 0;
        let myReq: number;
        let keys: any = {};

        // Generate Initial Platforms
        const generatePlatforms = () => {
            platforms = [];
            // Ground platform
            platforms.push({ x: 0, y: canvas.height - 40, width: canvas.width, height: 40, type: 'ground' });
            
            let y = canvas.height - 100;
            while (y > -1000) {
                const x = Math.random() * (canvas.width - 70);
                platforms.push({ x, y, width: 70, height: 15, type: 'cloud' });
                y -= 90; // Spacing
            }
        };
        generatePlatforms();

        // Input Handling
        const handleKeyDown = (e: KeyboardEvent) => { keys[e.code] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys[e.code] = false; };
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches[0].clientX < canvas.width / 2) keys['ArrowLeft'] = true;
            else keys['ArrowRight'] = true;
        };
        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            keys['ArrowLeft'] = false;
            keys['ArrowRight'] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchend', handleTouchEnd);

        // Asset Drawing Helpers
        const drawCloud = (x: number, y: number, w: number, h: number) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x + 10, y + h/2, h/2 + 5, 0, Math.PI * 2);
            ctx.arc(x + w - 10, y + h/2, h/2 + 5, 0, Math.PI * 2);
            ctx.rect(x + 10, y, w - 20, h);
            ctx.fill();
        };

        const drawPlayer = (x: number, y: number) => {
            // Body
            ctx.fillStyle = '#FACC15'; // Yellow Character
            ctx.beginPath();
            ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 10, y + 12, 2, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 12, 2, 0, Math.PI * 2);
            ctx.fill();
            // Smile
            ctx.beginPath();
            ctx.arc(x + 15, y + 15, 8, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
        };

        const update = () => {
            // Horizontal Movement
            if (keys['ArrowLeft']) player.vx = -MOVE_SPEED;
            else if (keys['ArrowRight']) player.vx = MOVE_SPEED;
            else player.vx *= 0.9; // Friction

            player.x += player.vx;
            
            // Screen Wrap
            if (player.x < -player.width) player.x = canvas.width;
            if (player.x > canvas.width) player.x = -player.width;

            // Gravity
            player.vy += GRAVITY;
            player.y += player.vy;

            // Camera Follow (Scroll Up)
            if (player.y < canvas.height / 2 && player.vy < 0) {
                player.y = canvas.height / 2;
                const diff = Math.abs(player.vy);
                scoreValue += Math.floor(diff);
                setScore(scoreValue);
                
                platforms.forEach(p => {
                    p.y += diff;
                    if (p.y > canvas.height) {
                        // Recycle platform to top
                        p.y = -20;
                        p.x = Math.random() * (canvas.width - 70);
                    }
                });
            }

            // Collision Detection (Only when falling)
            if (player.vy > 0) {
                platforms.forEach(p => {
                    if (
                        player.y + player.height > p.y &&
                        player.y + player.height < p.y + p.height + 10 &&
                        player.x + player.width > p.x &&
                        player.x < p.x + p.width
                    ) {
                        player.vy = JUMP_FORCE;
                        // Add particles on jump
                        for(let i=0; i<5; i++) {
                            particles.push({ x: player.x+15, y: player.y+30, vx: (Math.random()-0.5)*5, vy: Math.random()*2, life: 1.0 });
                        }
                    }
                });
            }

            // Game Over Check
            if (player.y > canvas.height) {
                setGameOver(true);
                setGameStarted(false);
                cancelAnimationFrame(myReq);
                return;
            }

            // Draw Background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#60A5FA'); // Blue Sky
            gradient.addColorStop(1, '#BFDBFE'); // Light Blue
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Platforms
            platforms.forEach(p => {
                if (p.type === 'ground') {
                    ctx.fillStyle = '#4ADE80';
                    ctx.fillRect(p.x, p.y, p.width, p.height);
                } else {
                    drawCloud(p.x, p.y, p.width, p.height);
                }
            });

            // Draw Particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.05;
                ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
                ctx.fill();
                if (p.life <= 0) particles.splice(i, 1);
            });

            drawPlayer(player.x, player.y);

            myReq = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(myReq);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameStarted]);

    const startGame = () => {
        setGameOver(false);
        setScore(0);
        setGameStarted(true);
    };

    return (
        <div className="bg-sky-300 rounded-2xl p-1 h-full relative overflow-hidden shadow-inner border-4 border-white min-h-[350px]">
            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30">
                    <h3 className="font-black text-white text-sm drop-shadow-sm">CLOUD HOP</h3>
                    <p className="text-[10px] text-white font-medium opacity-90">Tap sides or use Arrows</p>
                </div>
                <div className="bg-yellow-400 px-4 py-2 rounded-xl shadow-lg border-2 border-white transform rotate-3">
                    <p className="text-xs font-bold text-yellow-900 uppercase">Score</p>
                    <p className="text-2xl font-black text-white leading-none drop-shadow-md">{Math.floor(score)}</p>
                </div>
            </div>
            
            <canvas 
                ref={canvasRef} 
                width={400} 
                height={500} 
                className="w-full h-full bg-sky-400 rounded-xl cursor-pointer"
            />

            {(!gameStarted || gameOver) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm p-6 text-center">
                    {gameOver && (
                        <div className="mb-6 animate-in zoom-in">
                            <div className="text-6xl mb-2">🌤️</div>
                            <h2 className="text-3xl font-black text-white mb-1">Game Over</h2>
                            <p className="text-gray-300">You reached {Math.floor(score)}m</p>
                        </div>
                    )}
                    {!gameOver && (
                        <div className="mb-8 animate-in slide-in-from-bottom-5">
                            <Cloud className="w-20 h-20 text-white mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-black text-white mb-2">Ready to Hop?</h2>
                            <p className="text-sky-100">Jump on clouds to reach the stars!</p>
                        </div>
                    )}
                    <button onClick={startGame} className="bg-yellow-400 text-black px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1">
                        {gameOver ? <RefreshCw className="w-6 h-6"/> : <Play className="w-6 h-6"/>} {gameOver ? 'Try Again' : 'Start Game'}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- SKELETON LOADER ---
const SpecialistSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[400px]">
      <div className="h-64 bg-gray-200 animate-pulse"></div>
      <div className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-6 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
  </div>
);

// --- WAITING ROOM MODAL ---
const WaitingRoomModal: React.FC<{ userId: string; onLeave: () => void; onReady: () => void }> = ({ userId, onLeave, onReady }) => {
    const [position, setPosition] = useState<number>(0);
    const [estWait, setEstWait] = useState<number>(5);
    const [selectedGame, setSelectedGame] = useState<'mindful' | 'cloud'>('cloud');

    useEffect(() => {
        const pos = Database.joinQueue(userId);
        setPosition(pos);
        setEstWait(Math.ceil(pos * 1.5));

        const interval = setInterval(() => {
            const currentPos = Database.getQueuePosition(userId);
            if (currentPos === 0 || currentPos === 1) {
                clearInterval(interval);
                onReady();
            } else {
                if (Math.random() > 0.7) Database.advanceQueue(); 
                setPosition(currentPos);
                setEstWait(Math.ceil(currentPos * 1.5));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [userId, onReady]);

    const handleLeave = () => {
        Database.leaveQueue(userId);
        onLeave();
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FFFBEB] w-full max-w-4xl rounded-3xl p-6 md:p-8 text-center relative shadow-2xl border-4 border-white overflow-hidden">
                {/* Header Bar */}
                <div className="absolute top-0 left-0 w-full h-16 bg-white border-b border-yellow-100 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Hourglass className="w-5 h-5 text-yellow-500 animate-spin-slow" />
                        <span className="font-bold text-gray-900">Waiting Room</span>
                    </div>
                    <button onClick={handleLeave} className="text-gray-400 hover:text-red-500 font-bold text-xs transition-colors border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-red-50">Leave Queue</button>
                </div>

                <div className="mt-16 flex flex-col lg:flex-row gap-8 h-[600px]">
                    {/* Left: Status */}
                    <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-yellow-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Position</p>
                            <div className="text-6xl font-black text-black tracking-tighter">#{position}</div>
                            <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-green-500 animate-pulse" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200">
                            <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-1">Estimated Wait</p>
                            <div className="text-4xl font-black text-yellow-900">{estWait}<span className="text-lg font-bold"> mins</span></div>
                        </div>

                        <div className="bg-gray-900 text-white p-4 rounded-2xl text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center"><Info className="w-4 h-4"/></div>
                                <p className="font-bold text-sm">Did you know?</p>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">Playing simple games while waiting can reduce cortisol levels by up to 15% before a therapy session.</p>
                        </div>
                    </div>

                    {/* Right: Games */}
                    <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-gray-200 shadow-inner p-2 flex flex-col">
                        <div className="flex justify-center gap-2 mb-2 bg-gray-50 p-1 rounded-xl self-center">
                            <button onClick={() => setSelectedGame('cloud')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${selectedGame === 'cloud' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}><Cloud className="w-4 h-4"/> Cloud Hop</button>
                            <button onClick={() => setSelectedGame('mindful')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${selectedGame === 'mindful' ? 'bg-yellow-500 text-black shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}><Sparkles className="w-4 h-4"/> Mindful Match</button>
                        </div>
                        <div className="flex-1 overflow-hidden rounded-2xl relative border border-gray-100">
                            {selectedGame === 'mindful' ? <MindfulMatchGame /> : <CloudHopGame />}
                        </div>
                    </div>
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

const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [text, setText] = useState("Inhale");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Play calming loop from CDN
        audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-impulse-30032.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));

        const steps = [{ text: "Inhale", delay: 4000 }, { text: "Hold", delay: 4000 }, { text: "Exhale", delay: 4000 }, { text: "Hold", delay: 4000 }];
        let currentStep = 0;
        const runLoop = () => { setText(steps[currentStep].text); currentStep = (currentStep + 1) % steps.length; };
        runLoop();
        const interval = setInterval(runLoop, 4000);
        
        return () => { 
            clearInterval(interval); 
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <button onClick={onClose} className="absolute top-0 right-0 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
                <div className="absolute inset-0 bg-peutic-yellow/20 rounded-full animate-breathe"></div>
                <div className="absolute inset-12 bg-peutic-yellow/40 rounded-full animate-breathe" style={{ animationDelay: '1s' }}></div>
                <div className="relative z-10 text-center text-white">
                    <h2 className="text-4xl font-bold mb-2">{text}</h2>
                    <p className="text-white/60">Listen to the sound...</p>
                </div>
             </div>
        </div>
    );
};

// --- PROFILE EDIT MODAL ---
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
                    <img src={url} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.name}`} />
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

// --- MAIN DASHBOARD ---
const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onStartSession }) => {
  const [weather, setWeather] = useState<'confetti' | 'rain' | null>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'history' | 'settings'>('hub');
  const [showPayment, setShowPayment] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showPlay, setShowPlay] = useState(false); 
  const [showQueue, setShowQueue] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingCompanion, setPendingCompanion] = useState<Companion | null>(null);
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyInsight, setDailyInsight] = useState<string>('');
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
  
  useEffect(() => {
      // Greeting Logic
      const hour = new Date().getHours();
      if (hour < 12) setTimeGreeting('Good Morning');
      else if (hour < 18) setTimeGreeting('Good Afternoon');
      else setTimeGreeting('Good Evening');

      const refreshData = () => {
        const dbUser = Database.getUser();
        if (dbUser) setBalance(dbUser.balance);
        const txs = Database.getUserTransactions(user.id);
        setTransactions(txs);
        
        // Calculate Weekly Goal Progress (simulated 3 sessions/week)
        const thisWeekSessions = txs.filter(t => {
            const d = new Date(t.date);
            const now = new Date();
            return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000 && t.amount < 0;
        });
        setWeeklyGoal(thisWeekSessions.length);

        if (!loadingCompanions) setCompanions(Database.getCompanions());
      };

      refreshData();
      const interval = setInterval(refreshData, 5000);

      setTimeout(() => {
         setCompanions(Database.getCompanions());
         setLoadingCompanions(false);
      }, 1500);

      return () => clearInterval(interval);
  }, [showPayment, user.id]);

  useEffect(() => { generateDailyInsight(user.name).then(setDailyInsight); }, [user.name]);

  const handlePaymentSuccess = (minutesAdded: number, cost: number) => {
      Database.topUpWallet(minutesAdded, cost);
      setBalance(prev => prev + minutesAdded);
      setShowPayment(false);
      setPaymentError(undefined);
      setWeather('confetti');
      setTimeout(() => setWeather(null), 5000);
  };

  const handleConnectRequest = (companion: Companion) => {
      if (balance <= 0) { setPaymentError("You need to add credits to start a session."); setShowPayment(true); return; } 
      const activeSessions = Database.getActiveSessionCount();
      const settings = Database.getSettings();
      if (activeSessions >= settings.maxConcurrentSessions) { setPendingCompanion(companion); setShowQueue(true); } else { onStartSession(companion); }
  };

  const handleQueueReady = () => { setShowQueue(false); Database.leaveQueue(user.id); if (pendingCompanion) { onStartSession(pendingCompanion); setPendingCompanion(null); } };

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

  const filteredCompanions = companions.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBEB] to-[#FFF1F2] font-sans text-gray-900 selection:bg-yellow-200 overflow-hidden">
      {weather && <WeatherEffect type={weather} />}
      
      <nav className="bg-white/80 backdrop-blur-md border-b border-yellow-100 sticky top-0 z-30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-peutic-yellow rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200/50">
                   <Heart className="w-6 h-6 fill-black text-black" />
               </div>
               <span className="text-xl font-bold tracking-tight hidden md:block">Peutic</span>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full">
                 <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                 <span className="text-xs font-bold text-orange-700">{streak} Day Streak</span>
              </div>
              <div className="hidden md:block px-4 py-2 bg-white rounded-lg border border-yellow-200 text-sm text-gray-500 font-medium italic shadow-sm max-w-xs truncate">"{dailyInsight}"</div>
              <div className="flex items-center gap-2 md:gap-4 bg-gray-900 text-white px-3 md:px-5 py-2 rounded-full shadow-xl">
                <div className="hidden md:block text-xs text-gray-400 font-medium uppercase tracking-wider">Balance</div>
                <div className={`font-mono font-bold text-base md:text-lg ${balance <= 0 ? 'text-red-500' : 'text-peutic-yellow'}`}>{Math.floor(balance)} mins</div>
                <button onClick={() => { setPaymentError(undefined); setShowPayment(true); }} className="bg-gray-700 p-1.5 rounded-full hover:bg-gray-600 transition-colors"><Plus className="w-4 h-4 text-white" /></button>
              </div>
              <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
              <button onClick={onLogout} className="text-gray-500 hover:text-black transition-colors"><LogOut className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-8">
           <div className="w-full md:w-64 flex-shrink-0 space-y-4">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-yellow-100 text-center flex md:block items-center gap-4 md:gap-0 relative group">
                    <button onClick={() => setShowProfile(true)} className="absolute top-2 right-2 p-1.5 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-100"><Edit2 className="w-3 h-3" /></button>
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-200 mx-auto md:mb-4 overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                        <AvatarImage src={user.avatar || ''} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left md:text-center flex-1">
                        <h3 className="font-bold text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-500 mb-0 md:mb-4">Premium Member</p>
                        {user.subscriptionStatus === 'BANNED' && <p className="text-xs text-red-600 font-bold bg-red-100 p-1 rounded mb-2 inline-block">ACCOUNT RESTRICTED</p>}
                        <button onClick={() => { setPaymentError(undefined); setShowPayment(true); }} className="hidden md:block w-full py-2 bg-peutic-yellow rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors mt-2">Add Funds</button>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 hidden md:block">
                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-500 uppercase">Weekly Goal</span><Target className="w-4 h-4 text-gray-400" /></div>
                    <p className="text-sm font-bold text-gray-900 mb-3">{weeklyGoal} / 3 Sessions</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2"><div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (weeklyGoal / 3) * 100)}%` }}></div></div>
                    <p className="text-[10px] text-gray-400 text-center">Complete 2 more to unlock badge</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden flex md:block justify-between md:justify-start">
                    {[{ id: 'hub', icon: LayoutDashboard, label: 'Wellness Hub' }, { id: 'history', icon: Clock, label: 'History' }, { id: 'settings', icon: Settings, label: 'Settings' }].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 md:px-6 py-4 text-xs md:text-sm font-bold transition-colors ${activeTab === item.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-yellow-50'}`}>
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-peutic-yellow' : 'text-gray-400'}`} />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                </div>
           </div>

           <div className="flex-1">
                {activeTab === 'hub' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Daily Wellness</h4>
                            <div className="bg-white rounded-2xl border border-yellow-100 p-6 shadow-sm mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 hidden lg:block">
                                     <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center gap-3 animate-pulse-glow">
                                        <div className="bg-yellow-100 p-2 rounded-full"><Trophy className="w-5 h-5 text-yellow-600" /></div>
                                        <div><p className="text-xs font-bold text-gray-900">Daily Win</p><p className="text-[10px] text-gray-500">You logged in today!</p></div>
                                     </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{timeGreeting}, {user.name.split(' ')[0]}</h2>
                                        <p className="text-gray-500">How are you feeling right now?</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Happy', 'Calm', 'Neutral', 'Anxious', 'Sad'].map((m: any) => (
                                            <button key={m} onClick={() => handleSaveMood(m)} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-yellow-100 flex items-center justify-center text-xl transition-all hover:scale-110" title={m}>
                                                {m === 'Happy' ? '😄' : m === 'Calm' ? '😌' : m === 'Neutral' ? '😐' : m === 'Anxious' ? '😰' : '😔'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <button onClick={() => setShowBreathing(true)} className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 group">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform"><Wind className="w-5 h-5" /></div>
                                        <div className="text-left hidden sm:block"><span className="block font-bold text-sm">Breathe</span><span className="text-xs opacity-70">Panic Relief</span></div>
                                    </button>
                                    <button onClick={() => setShowJournal(!showJournal)} className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100 group">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen className="w-5 h-5" /></div>
                                        <div className="text-left hidden sm:block"><span className="block font-bold text-sm">Journal</span><span className="text-xs opacity-70">Private Notes</span></div>
                                    </button>
                                    <button onClick={() => setShowPlay(true)} className="flex items-center gap-3 p-4 rounded-xl bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors border border-yellow-200 group">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform"><Gamepad2 className="w-5 h-5" /></div>
                                        <div className="text-left hidden sm:block"><span className="block font-bold text-sm">Play</span><span className="text-xs opacity-70">Games</span></div>
                                    </button>
                                </div>
                                {showJournal && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in zoom-in">
                                        <textarea className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none resize-none mb-2" placeholder="Write down your thoughts safely here..." value={journalContent} onChange={(e) => setJournalContent(e.target.value)}></textarea>
                                        <div className="flex justify-end"><button onClick={handleSaveJournal} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"><Save className="w-3 h-3" /> Save to Vault</button></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Specialist Network</h4>
                            <div className="bg-white border border-yellow-200 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm">
                                <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Scheduling Notice</p>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">Due to high global demand, if your selected specialist is finalizing another session, you may be connected with an equally qualified <strong>Partner Specialist</strong> to ensure immediate care.</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <div className="w-full md:w-auto"><h2 className="text-2xl font-bold text-gray-900">Your Care Team</h2><p className="text-gray-500">Available 24/7 for video sessions.</p></div>
                                <div className="relative w-full md:w-auto"><Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search specialists..." className="w-full md:w-64 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            </div>

                            {/* SPECIALIST GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loadingCompanions ? (
                                    <>
                                        <SpecialistSkeleton />
                                        <SpecialistSkeleton />
                                        <SpecialistSkeleton />
                                    </>
                                ) : (
                                    filteredCompanions.map(companion => (
                                        <div key={companion.id} className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                            <div className="h-64 bg-gray-200 relative overflow-hidden">
                                                <AvatarImage 
                                                    src={companion.imageUrl} 
                                                    alt={companion.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${companion.status === 'AVAILABLE' ? 'bg-green-500 text-white' : companion.status === 'OFFLINE' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>{companion.status}</div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                    <h3 className="font-bold text-xl text-white">{companion.name}</h3>
                                                    <p className="text-sm text-gray-300 font-medium">{companion.specialty}</p>
                                                </div>
                                            </div>
                                            <div className="p-6 pt-4">
                                                <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-1 text-yellow-500 font-bold text-sm"><Star className="w-4 h-4 fill-current" /> {companion.rating}</div><span className="text-xs text-gray-400">ID: {companion.replicaId.substring(0, 4)}</span></div>
                                                <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{companion.bio}</p>
                                                <button onClick={() => handleConnectRequest(companion)} disabled={companion.status !== 'AVAILABLE' || user.subscriptionStatus === 'BANNED'} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${companion.status === 'AVAILABLE' && user.subscriptionStatus !== 'BANNED' ? 'bg-black text-white hover:bg-peutic-yellow hover:text-black shadow-lg hover:shadow-yellow-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                                    {companion.status === 'AVAILABLE' ? <><Video className="w-4 h-4" /> Connect Now</> : 'Unavailable'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'history' && (
                    <div className="bg-white rounded-2xl border border-yellow-100 overflow-hidden shadow-sm animate-in fade-in">
                        <div className="p-6 border-b border-gray-100"><h3 className="text-xl font-bold text-gray-900">Transaction & Session History</h3></div>
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center"><div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Clock className="w-8 h-8 text-gray-400" /></div><p className="text-gray-500">No transaction history found.</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm"><tr><th className="px-6 py-4 whitespace-nowrap">Description</th><th className="px-6 py-4 whitespace-nowrap">Date</th><th className="px-6 py-4 whitespace-nowrap">Minutes</th><th className="px-6 py-4 whitespace-nowrap">Status</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">{transactions.map((tx) => (<tr key={tx.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-bold text-gray-900">{tx.description}</td><td className="px-6 py-4 text-gray-500 text-sm">{new Date(tx.date).toLocaleDateString()}</td><td className={`px-6 py-4 font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount} mins</td><td className="px-6 py-4"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> {tx.status}</span></td></tr>))}</tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'settings' && (
                     <div className="bg-white rounded-2xl border border-yellow-100 p-8 shadow-sm animate-in fade-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
                        <div className="space-y-6">
                             <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-green-600"><CreditCard className="w-6 h-6" /></div>
                                    <div><p className="text-green-800 font-bold text-lg">Lifetime Member Status: Active</p><p className="text-green-700 text-sm mt-1">You are saving <strong>$0.50/min</strong> compared to standard pricing. Total estimated savings: <span className="font-black">${(transactions.reduce((acc, t) => t.amount < 0 ? acc + Math.abs(t.amount) : acc, 0) * 0.50).toFixed(2)}</span></p></div>
                                </div>
                             </div>
                             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><div><p className="font-bold">Email Notifications</p><p className="text-sm text-gray-500">Receive session summaries via email</p></div><div className="w-12 h-6 bg-black rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div></div>
                             <div className="p-4 bg-red-50 rounded-xl border border-red-100"><p className="font-bold text-red-600 mb-2">Delete Account</p><p className="text-sm text-gray-500 mb-4">Permanently remove your data and access.</p><button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">Delete Account</button></div>
                        </div>
                    </div>
                )}
           </div>
        </div>
      </div>

      {showQueue && <WaitingRoomModal userId={user.id} onLeave={() => setShowQueue(false)} onReady={handleQueueReady} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} initialError={paymentError} />}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={refresh} />}
      {showPlay && <PlayModal onClose={() => setShowPlay(false)} />}
    </div>
  );
};

function Star(props: any) { return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }

export default Dashboard;
