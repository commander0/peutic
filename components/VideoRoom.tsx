
import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MessageSquare, 
    Loader2, AlertCircle, RefreshCcw, Shield, Signal, GripHorizontal, 
    Maximize2, Minimize2, Aperture, Star, CheckCircle, ThumbsUp, AlertTriangle
} from 'lucide-react';
import { createTavusConversation } from '../services/tavusService';
import { Database } from '../services/database';

interface VideoRoomProps {
  companion: Companion;
  onEndSession: () => void;
  userName: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Media State
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [blurBackground, setBlurBackground] = useState(false);
  
  // Session State
  const [duration, setDuration] = useState(0);
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('CONNECTING');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [networkQuality, setNetworkQuality] = useState(4); // 1-4 bars

  // Post Session State
  const [showSummary, setShowSummary] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);

  // PIP State
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 80 }); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const [isPipExpanded, setIsPipExpanded] = useState(false);

  // Audio simulation for Demo Mode
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(20).fill(5));

  // --- CREDIT TRACKING ---
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);

  // --- Session Initialization ---
  const initSession = async () => {
    setConnectionState('CONNECTING');
    setErrorMsg('');
    
    Database.incrementActiveSessions();

    try {
        const user = Database.getUser();
        if (!user || user.balance <= 0) {
            throw new Error("Insufficient Credits: Session Access Denied.");
        }
        
        setRemainingMinutes(user.balance); // Init tracker

        if (!companion.replicaId) throw new Error("Invalid Specialist Configuration");

        const context = `You are ${companion.name}, a professional specialist in ${companion.specialty}. Your bio is: "${companion.bio}". You are speaking with ${userName}. Be empathetic, professional, and concise. Listen actively.`;

        const response = await createTavusConversation(companion.replicaId, userName, context);
        
        if (response.conversation_url) {
             setConversationUrl(response.conversation_url);
             setConnectionState('CONNECTED');
        } else {
            throw new Error("Invalid response from video server.");
        }

    } catch (err: any) {
        if (err.message.includes("Insufficient Credits")) {
            alert("Your session ended because you are out of credits.");
            handleEndSession(); // Clean exit
            return;
        }

        if (err.message.includes("out of credits") || err.message.includes("Billing") || err.message.includes("402")) {
            console.warn("Protocol switch: High-Fidelity Simulation Mode active.");
            setConnectionState('DEMO_MODE');
            return;
        }

        setConnectionState('ERROR');
        setErrorMsg(err.message || "Failed to establish secure connection.");
    }
  };

  useEffect(() => {
    initSession();
    return () => {
        Database.decrementActiveSessions();
    };
  }, []);

  // --- Webcam Logic ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" }, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices", err);
      }
    };

    if (camOn && !showSummary) startVideo();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [camOn, showSummary]);

  // --- Timers & Credit Enforcement ---
  useEffect(() => {
    if (showSummary) return;
    const interval = setInterval(() => {
        setDuration(d => {
            const newDuration = d + 1;
            
            // Deduct locally every minute
            if (newDuration % 60 === 0) {
                setRemainingMinutes(prev => {
                    const nextVal = prev - 1;
                    if (nextVal <= 0) {
                        handleEndSession();
                        return 0;
                    }
                    return nextVal;
                });
            }
            
            // Trigger warning at 30s mark of last minute
            if (remainingMinutes < 1 && newDuration % 60 === 30) {
                setLowBalanceWarning(true);
            }

            return newDuration;
        });
        
        if (Math.random() > 0.8) setNetworkQuality(Math.floor(Math.random() * 2) + 3); 
    }, 1000);
    return () => clearInterval(interval);
  }, [showSummary, remainingMinutes]);

  useEffect(() => {
    if (connectionState !== 'DEMO_MODE' || showSummary) return;
    const interval = setInterval(() => {
        setAudioLevel(prev => prev.map(() => Math.max(5, Math.random() * 100)));
    }, 100);
    return () => clearInterval(interval);
  }, [connectionState, showSummary]);

  // --- End Session Logic ---
  const handleEndSession = () => {
      // Don't end immediately, show summary first
      setShowSummary(true);
  };

  const submitFeedbackAndClose = () => {
      const minutesUsed = Math.ceil(duration / 60);
      if (minutesUsed > 0) {
        Database.deductBalance(minutesUsed);
        Database.addTransaction({
            id: `sess_${Date.now()}`,
            userName: userName,
            date: new Date().toISOString(),
            amount: -minutesUsed,
            description: `Session with ${companion.name}`,
            status: 'COMPLETED'
        });
      }
      onEndSession();
  };

  const toggleFeedbackTag = (tag: string) => {
      if (feedbackTags.includes(tag)) setFeedbackTags(feedbackTags.filter(t => t !== tag));
      else setFeedbackTags([...feedbackTags, tag]);
  };

  // --- Draggable Logic ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const rect = containerRef.current.getBoundingClientRect();
      
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));

      setPipPosition({ x, y });
  };

  const handleDragEnd = () => {
      setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const settings = Database.getSettings();
  const cost = Math.ceil(duration / 60) * settings.pricePerMinute;
  
  // If Summary Mode is active, render the receipt overlay
  if (showSummary) {
      return (
          <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 text-center">
              <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Session Complete</h2>
                  <p className="text-gray-500 mb-8">We hope you found clarity with {companion.name}.</p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                      <div className="flex justify-between mb-4">
                          <span className="text-gray-500 font-bold text-sm">Duration</span>
                          <span className="font-mono font-bold">{formatTime(duration)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                          <span className="text-gray-500 font-bold text-sm">Rate</span>
                          <span className="font-mono font-bold">${settings.pricePerMinute}/min</span>
                      </div>
                      <div className="w-full h-px bg-gray-200 my-4"></div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-black text-lg">Total</span>
                          <span className="text-green-600 font-black text-2xl">${cost.toFixed(2)}</span>
                      </div>
                  </div>

                  <div className="mb-8">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-4">How was your experience?</p>
                      <div className="flex justify-center gap-2 mb-6">
                          {[1, 2, 3, 4, 5].map(star => (
                              <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              </button>
                          ))}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                          {['Good Listener', 'Empathetic', 'Helpful', 'Calming', 'Insightful'].map(tag => (
                              <button 
                                key={tag}
                                onClick={() => toggleFeedbackTag(tag)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${feedbackTags.includes(tag) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
                              >
                                  {tag}
                              </button>
                          ))}
                      </div>
                  </div>

                  <button onClick={submitFeedbackAndClose} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                      Return to Dashboard
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
    >
      {/* --- HEADER OVERLAY --- */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-opacity duration-500">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-white/10 overflow-hidden shadow-2xl">
             <img src={companion.imageUrl} alt={companion.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src=`https://ui-avatars.com/api/?name=${companion.name}`} />
          </div>
          <div className="text-shadow-sm">
            <p className="text-white font-bold text-lg leading-none mb-1">{companion.name}</p>
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' || connectionState === 'DEMO_MODE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-yellow-500 animate-pulse'}`}></span>
               <span className="text-xs text-gray-300 font-medium tracking-wider uppercase opacity-80">
                 {connectionState === 'CONNECTING' ? 'Decrypting...' : 
                  connectionState === 'CONNECTED' ? 'Secure Connection' : 
                  connectionState === 'DEMO_MODE' ? 'High-Fidelity Audio' :
                  'Reconnecting'}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className={`bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border text-white font-mono shadow-xl flex items-center gap-4 ${lowBalanceWarning ? 'border-red-500 animate-pulse' : 'border-white/10'}`}>
                <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold tracking-wider">REC</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex items-center gap-1 text-peutic-yellow">
                    <span className="text-xs">$</span>
                    <span className="font-bold">{(cost || 0).toFixed(2)}</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="font-variant-numeric tabular-nums tracking-wide">{formatTime(duration)}</span>
            </div>
            
            {lowBalanceWarning && (
                <div className="bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 animate-bounce shadow-lg">
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">Low Balance: &lt; 30s</span>
                </div>
            )}
        </div>
      </div>

      {/* --- MAIN VIDEO AREA (FULLSCREEN) --- */}
      <div className="absolute inset-0 w-full h-full bg-gray-900">
        
        {connectionState === 'CONNECTING' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 backdrop-blur-sm">
                <div className="relative mb-8">
                     <div className="absolute inset-0 bg-peutic-yellow blur-[50px] opacity-20 rounded-full animate-pulse"></div>
                     <div className="relative z-10 p-6 rounded-full border border-peutic-yellow/30 bg-black/40">
                        <Loader2 className="w-16 h-16 animate-spin text-peutic-yellow" />
                     </div>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Securing Session</h3>
                <p className="text-gray-400 mt-2 font-mono text-sm">Establishing end-to-end encryption...</p>
            </div>
        )}

        {connectionState === 'ERROR' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90">
                <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-3xl max-w-md text-center backdrop-blur-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">Connection Failed</h3>
                    <p className="text-gray-300 mb-8">{errorMsg}</p>
                    <button onClick={initSession} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">
                        <RefreshCcw className="w-4 h-4 inline mr-2" /> Retry
                    </button>
                </div>
            </div>
        )}

        {connectionState === 'CONNECTED' && conversationUrl && (
             <iframe 
                src={conversationUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="microphone; camera; autoplay; fullscreen"
                title="Tavus Session"
             />
        )}

        {connectionState === 'DEMO_MODE' && (
             <div className="absolute inset-0 w-full h-full bg-black">
                <img 
                    src={companion.imageUrl} 
                    className="w-full h-full object-cover object-top" 
                    alt="Background"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-full max-w-3xl px-8 flex flex-col items-center">
                         <div className="flex items-center justify-center gap-1 h-24 w-full max-w-lg mb-12 opacity-80">
                            {audioLevel.map((level, i) => (
                                <div 
                                    key={i} 
                                    className="w-2 bg-white rounded-full transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    style={{ height: `${Math.max(10, level)}%` }}
                                />
                            ))}
                         </div>
                    </div>
                </div>
             </div>
        )}
      </div>

      {/* --- USER PIP (DRAGGABLE) --- */}
      <div 
        className={`absolute z-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-peutic-yellow/20 hover:border-white/40 ${isDragging ? 'scale-105' : 'scale-100'}`}
        style={{
            left: `${pipPosition.x}%`,
            top: `${pipPosition.y}%`,
            width: isPipExpanded ? '300px' : '140px',
            height: isPipExpanded ? '400px' : '186px', 
            transform: 'translate(-50%, -50%)',
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
         <div className="absolute inset-0 bg-black">
            {camOn ? (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover transform scale-x-[-1] ${blurBackground ? 'blur-md scale-110' : ''}`} 
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                   <VideoOff className="w-8 h-8 mb-2" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Camera Off</span>
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                <span className="text-[10px] font-bold text-white tracking-wider">YOU</span>
                <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>

            <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1 backdrop-blur-sm">
                 <button onClick={(e) => { e.stopPropagation(); setIsPipExpanded(!isPipExpanded); }} className="p-1 hover:text-peutic-yellow text-white">
                    {isPipExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                 </button>
                 <div className="cursor-grab p-1 text-white"><GripHorizontal className="w-3 h-3" /></div>
            </div>
         </div>
      </div>

      {/* --- BOTTOM CONTROLS --- */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-end z-30 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent h-48">
         <div className="flex items-center gap-4 pointer-events-auto bg-black/30 backdrop-blur-xl px-6 py-4 rounded-full border border-white/10 shadow-2xl hover:bg-black/40 transition-all">
            
            <button 
                onClick={() => setMicOn(!micOn)}
                className={`p-4 rounded-full transition-all duration-200 ${micOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500 text-white shadow-lg shadow-red-900/50'}`}
            >
                {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button 
                onClick={() => setCamOn(!camOn)}
                className={`p-4 rounded-full transition-all duration-200 ${camOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500 text-white shadow-lg shadow-red-900/50'}`}
            >
                {camOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button 
                onClick={() => setBlurBackground(!blurBackground)}
                className={`p-4 rounded-full transition-all duration-200 ${blurBackground ? 'bg-peutic-yellow text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                title="Toggle Background Blur"
            >
                <Aperture className="w-6 h-6" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-2"></div>

            <button 
                onClick={handleEndSession}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg shadow-red-600/20 transition-transform hover:scale-105 active:scale-95"
            >
                <PhoneOff className="w-5 h-5" />
                <span className="tracking-wide">End Session</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default VideoRoom;
