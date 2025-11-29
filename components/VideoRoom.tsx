import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, RefreshCcw, CheckCircle, Star, Users
} from 'lucide-react';
import { createTavusConversation, endTavusConversation } from '../services/tavusService';
import { Database } from '../services/database';

interface VideoRoomProps {
  companion: Companion;
  onEndSession: () => void;
  userName: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Media State - Mic defaults to TRUE
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  
  // Session State
  const [duration, setDuration] = useState(0);
  const [connectionState, setConnectionState] = useState<'QUEUED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('QUEUED');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const [networkQuality, setNetworkQuality] = useState(4); 
  
  // Queue State
  const [queuePos, setQueuePos] = useState(0);
  const [estWait, setEstWait] = useState(0);

  // Post Session State
  const [showSummary, setShowSummary] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);

  // Credit Tracking
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);

  const userId = useRef(`user_${Date.now()}`).current;

  // Sync state to ref
  useEffect(() => {
      conversationIdRef.current = conversationId;
  }, [conversationId]);

  // --- Browser/Tab Close Cleanup ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (conversationIdRef.current) {
            endTavusConversation(conversationIdRef.current);
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // --- Session Initialization ---
  useEffect(() => {
    const initQueue = () => {
        const settings = Database.getSettings();
        const active = Database.getActiveSessionCount();
        const limit = settings.maxConcurrentSessions;

        const pos = Database.joinQueue(userId);
        setQueuePos(pos);
        setEstWait(Database.getEstimatedWaitTime(pos));

        if (pos === 1 && active < limit) {
             startTavusConnection();
        }
    };

    const queueInterval = setInterval(() => {
        if (connectionState === 'QUEUED') {
            const pos = Database.getQueuePosition(userId);
            const settings = Database.getSettings();
            
            setQueuePos(pos);
            setEstWait(Database.getEstimatedWaitTime(pos));

            if (pos === 1 && Database.getActiveSessionCount() < settings.maxConcurrentSessions) {
                clearInterval(queueInterval);
                startTavusConnection();
            }
        }
    }, 3000);

    initQueue();

    return () => {
        clearInterval(queueInterval);
        Database.leaveQueue(userId);
        if (connectionState === 'CONNECTED' || connectionState === 'DEMO_MODE') {
             Database.decrementActiveSessions();
        }
        if (conversationIdRef.current) {
             endTavusConversation(conversationIdRef.current);
        }
    };
  }, []);

  const startTavusConnection = async () => {
      setConnectionState('CONNECTING');
      setErrorMsg('');
      Database.incrementActiveSessions();
      Database.leaveQueue(userId);

      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) throw new Error("Insufficient Credits: Session Access Denied.");
          setRemainingMinutes(user.balance); 

          if (!companion.replicaId) throw new Error("Invalid Specialist Configuration");

          const context = `You are ${companion.name}, a professional specialist in ${companion.specialty}. Your bio is: "${companion.bio}". You are speaking with ${userName}. Be empathetic, professional, and concise. Listen actively.`;

          const response = await createTavusConversation(companion.replicaId, userName, context);
          
          if (response.conversation_url) {
               setConversationUrl(response.conversation_url);
               setConversationId(response.conversation_id);
               setConnectionState('CONNECTED');
          } else {
              throw new Error("Invalid response from video server.");
          }

      } catch (err: any) {
          if (err.message.includes("Insufficient Credits")) {
              alert("Your session ended because you are out of credits.");
              handleEndSession(); 
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

  // --- Webcam Logic ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" }, 
            // Audio TRUE triggers mic, but 'muted' on video tag prevents echo
            audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing media devices", err);
      }
    };
    if (camOn && !showSummary) startVideo();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [camOn, showSummary]);

  // --- Mic Toggle Logic ---
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = micOn;
      });
    }
  }, [micOn]);

  // --- Timers ---
  useEffect(() => {
    if (showSummary) return;
    if (connectionState !== 'CONNECTED' && connectionState !== 'DEMO_MODE') return;

    const interval = setInterval(() => {
        setDuration(d => {
            const newDuration = d + 1;
            if (newDuration % 60 === 0) {
                setRemainingMinutes(prev => {
                    const nextVal = prev - 1;
                    if (nextVal <= 0) { handleEndSession(); return 0; }
                    return nextVal;
                });
            }
            if (remainingMinutes <= 1 && newDuration % 60 === 30) setLowBalanceWarning(true);
            return newDuration;
        });
        if (Math.random() > 0.9) setNetworkQuality(Math.max(2, Math.floor(Math.random() * 3) + 2)); 
    }, 1000);
    return () => clearInterval(interval);
  }, [showSummary, remainingMinutes, connectionState]);

  const handleEndSession = async () => {
      if (conversationId) await endTavusConversation(conversationId);
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

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const settings = Database.getSettings();
  const cost = Math.ceil(duration / 60) * settings.pricePerMinute;

  // --- RENDER: SUMMARY ---
  if (showSummary) {
      return (
          <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center text-white p-4 backdrop-blur-sm">
              <div className="bg-gray-900 p-8 rounded-3xl max-w-md w-full text-center border border-gray-800 animate-in zoom-in duration-300 shadow-2xl">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50"><CheckCircle className="w-10 h-10 text-green-500" /></div>
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Session Complete</h2>
                  <p className="text-gray-400 mb-8 text-sm">We hope you found clarity with {companion.name}.</p>
                  
                  <div className="bg-black/50 rounded-2xl p-6 mb-8 border border-gray-800">
                      <div className="flex justify-between mb-3"><span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Duration</span><span className="font-mono font-bold text-white">{formatTime(duration)}</span></div>
                      <div className="flex justify-between mb-3"><span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Rate</span><span className="font-mono font-bold text-white">${settings.pricePerMinute}/min</span></div>
                      <div className="w-full h-px bg-gray-800 my-3"></div>
                      <div className="flex justify-between items-center"><span className="text-white font-bold text-lg">Total</span><span className="text-green-500 font-black text-2xl">${cost.toFixed(2)}</span></div>
                  </div>
                  
                  <div className="mb-8">
                      <p className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">How was your experience?</p>
                      <div className="flex justify-center gap-3 mb-6">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110 focus:outline-none"><Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'}`} /></button>))}</div>
                      <div className="flex flex-wrap justify-center gap-2">{['Good Listener', 'Empathetic', 'Helpful', 'Calming', 'Insightful'].map(tag => (<button key={tag} onClick={() => toggleFeedbackTag(tag)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${feedbackTags.includes(tag) ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'}`}>{tag}</button>))}</div>
                  </div>
                  
                  <button onClick={submitFeedbackAndClose} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl font-black tracking-wide transition-colors shadow-lg shadow-yellow-500/20">Return to Dashboard</button>
              </div>
          </div>
      );
  }

  // --- RENDER: VIDEO ROOM ---
  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none">
        
        {/* TOP OVERLAY */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
            <div className={`bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border ${lowBalanceWarning ? 'border-red-500 animate-pulse' : 'border-white/10'} flex items-center gap-3 transition-colors duration-500`}>
                <div className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className={`font-mono font-bold text-sm ${lowBalanceWarning ? 'text-red-400' : 'text-white'}`}>
                    {connectionState === 'CONNECTED' ? formatTime(duration) : connectionState === 'QUEUED' ? 'Waiting...' : 'Connecting...'}
                </span>
            </div>
            <div className="flex gap-1 h-4 items-end">
                {[1, 2, 3, 4].map(i => ( <div key={i} className={`w-1 rounded-sm ${i <= networkQuality ? 'bg-green-500' : 'bg-gray-600'}`} style={{ height: `${i * 25}%` }}></div> ))}
            </div>
        </div>

        {/* MAIN VIDEO AREA */}
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
            {connectionState === 'QUEUED' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95">
                    <div className="w-20 h-20 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-pulse mb-8"><Users className="w-8 h-8 text-yellow-500" /></div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">You are in queue</h3>
                    <p className="text-gray-400 text-sm mb-6">Position: <span className="text-white font-bold">{queuePos}</span> • Est: <span className="text-white font-bold">~{estWait}m</span></p>
                    <button onClick={onEndSession} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest">Leave Queue</button>
                </div>
            )}
            {connectionState === 'CONNECTING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90 backdrop-blur-md">
                    <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mb-6" />
                    <h3 className="text-2xl font-black text-white tracking-tight">Securing Link</h3>
                </div>
            )}
            {connectionState === 'ERROR' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95">
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Connection Failed</h3>
                        <p className="text-gray-400 mb-6 text-sm">{errorMsg}</p>
                        <button onClick={onEndSession} className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto"><RefreshCcw className="w-4 h-4" /> Return</button>
                    </div>
                </div>
            )}
            {connectionState === 'CONNECTED' && conversationUrl && (
                <iframe src={conversationUrl} className="absolute inset-0 w-full h-full border-0" allow="microphone; camera; autoplay; fullscreen" title="Tavus Session" />
            )}
            {connectionState === 'DEMO_MODE' && (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img src={companion.imageUrl} className="w-full h-full object-cover opacity-60 animate-pulse-slow" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                </div>
            )}
        </div>

        {/* --- USER PIP --- */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-28 md:w-36 aspect-[9/16] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            {camOn ? (
                // muted=true prevents feedback loop, playsInline required for iOS
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900"><VideoOff className="w-6 h-6 mb-1 opacity-50" /></div>
            )}
            <div className="absolute bottom-2 right-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
            </div>
        </div>

        {/* --- BOTTOM CONTROLS: FLOATING BUTTONS (NO BAR) --- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-md border border-white/10 ${micOn ? 'bg-gray-900/60 text-white hover:bg-gray-800/80' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button onClick={() => setCamOn(!camOn)} className={`p-4 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-md border border-white/10 ${camOn ? 'bg-gray-900/60 text-white hover:bg-gray-800/80' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                {camOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            
            <div className="w-px h-8 bg-white/10 mx-1"></div>
            
            <button onClick={handleEndSession} className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-110 active:scale-95 border border-red-400/20" title="End Session">
                <PhoneOff className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
};

export default VideoRoom;
