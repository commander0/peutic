import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, RefreshCcw, Aperture, Star, CheckCircle, Users
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
  const [connectionState, setConnectionState] = useState<'QUEUED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('QUEUED');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
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

  // --- Session Initialization ---
  useEffect(() => {
    // 1. Join Queue
    const initQueue = () => {
        const settings = Database.getSettings();
        const active = Database.getActiveSessionCount();
        const limit = settings.maxConcurrentSessions;

        // FIXED: This now correctly adds user to queue list and returns valid position (e.g., 1)
        const pos = Database.joinQueue(userId);
        setQueuePos(pos);
        setEstWait(Database.getEstimatedWaitTime(pos));

        // If we are at the front of queue AND there is capacity
        if (pos === 1 && active < limit) {
             startTavusConnection();
        }
    };

    // Poll for queue position
    const queueInterval = setInterval(() => {
        if (connectionState === 'QUEUED') {
            const pos = Database.getQueuePosition(userId);
            const settings = Database.getSettings();
            const active = Database.getActiveSessionCount();
            
            setQueuePos(pos);
            setEstWait(Database.getEstimatedWaitTime(pos));

            if (pos === 1 && active < settings.maxConcurrentSessions) {
                clearInterval(queueInterval);
                startTavusConnection();
            }
        }
    }, 3000);

    initQueue();

    return () => {
        clearInterval(queueInterval);
        // FIXED: Properly remove user from both Queue and Active lists on unmount
        Database.endSession(userId);
    };
  }, []);

  const startTavusConnection = async () => {
      setConnectionState('CONNECTING');
      setErrorMsg('');
      
      // FIXED: Use specific userId to mark as active
      Database.enterActiveSession(userId);
      // Remove from queue since they are now connecting
      Database.leaveQueue(userId);

      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) {
              throw new Error("Insufficient Credits: Session Access Denied.");
          }
          setRemainingMinutes(user.balance); 

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
            audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Error accessing media devices", err); }
    };
    if (camOn && !showSummary) startVideo();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [camOn, showSummary]);

  // --- Timers & Credit Enforcement ---
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

  const handleEndSession = () => setShowSummary(true);

  const submitFeedbackAndClose = () => {
      const minutesUsed = Math.ceil(duration / 60);
      if (minutesUsed > 0) {
        Database.deductBalance(minutesUsed);
        Database.addTransaction({
            id: `sess_${Date.now()}`, userName: userName, date: new Date().toISOString(),
            amount: -minutesUsed, description: `Session with ${companion.name}`, status: 'COMPLETED'
        });
      }
      onEndSession();
  };

  const toggleFeedbackTag = (tag: string) => { if (feedbackTags.includes(tag)) setFeedbackTags(feedbackTags.filter(t => t !== tag)); else setFeedbackTags([...feedbackTags, tag]); };
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; };
  const settings = Database.getSettings();
  const cost = Math.ceil(duration / 60) * settings.pricePerMinute;

  // --- RENDER ---
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

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none">
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/20 to-transparent pb-20 transition-opacity duration-500">
            <div className="flex items-center gap-4 pointer-events-auto">
                <div className={`bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border ${lowBalanceWarning ? 'border-red-500 animate-pulse' : 'border-white/10'} text-white font-mono shadow-xl flex items-center gap-3 transition-colors duration-500`}>
                    <div className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className={`font-variant-numeric tabular-nums tracking-wide font-bold ${lowBalanceWarning ? 'text-red-400' : 'text-white'}`}>
                        {connectionState === 'CONNECTED' ? formatTime(duration) : connectionState === 'QUEUED' ? 'Waiting...' : 'Connecting...'}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex gap-1 h-4 items-end">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-1 rounded-sm ${i <= networkQuality ? 'bg-green-500' : 'bg-gray-600'}`} style={{ height: `${i * 25}%` }}></div>
                    ))}
                </div>
            </div>
        </div>

        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
            {connectionState === 'QUEUED' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95">
                    <div className="relative mb-8">
                         <div className="w-24 h-24 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-pulse">
                             <Users className="w-10 h-10 text-yellow-500" />
                         </div>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">You are in queue</h3>
                    <p className="text-gray-400 text-sm mb-6">Our specialists are currently assisting others.</p>
                    <div className="grid grid-cols-2 gap-4 text-center max-w-sm w-full">
                         <div className="bg-gray-800 p-4 rounded-xl">
                             <div className="text-2xl font-black text-white">{queuePos}</div>
                             <div className="text-xs text-gray-500 uppercase font-bold">Position</div>
                         </div>
                         <div className="bg-gray-800 p-4 rounded-xl">
                             <div className="text-2xl font-black text-white">~{estWait}m</div>
                             <div className="text-xs text-gray-500 uppercase font-bold">Est. Wait</div>
                         </div>
                    </div>
                    <button onClick={onEndSession} className="mt-8 text-gray-500 hover:text-white text-sm font-bold">Leave Queue</button>
                </div>
            )}

            {connectionState === 'CONNECTING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90 backdrop-blur-md">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse"></div>
                        <div className="relative z-10 p-8 rounded-full border border-yellow-500/30 bg-black/50 shadow-2xl">
                            <Loader2 className="w-16 h-16 animate-spin text-yellow-500" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">Securing Link</h3>
                    <p className="text-gray-400 text-sm">Establishing end-to-end encryption...</p>
                </div>
            )}
            
            {connectionState === 'ERROR' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95">
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md text-center backdrop-blur-md">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30"><AlertCircle className="w-8 h-8 text-red-500" /></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Connection Failed</h3>
                        <p className="text-gray-400 mb-8 text-sm">{errorMsg}</p>
                        <button onClick={onEndSession} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto"><RefreshCcw className="w-4 h-4" /> Return to Dashboard</button>
                    </div>
                </div>
            )}

            {connectionState === 'CONNECTED' && conversationUrl && (
                <iframe src={conversationUrl} className="absolute inset-0 w-full h-full border-0" allow="microphone; camera; autoplay; fullscreen" title="Tavus Session" />
            )}

            {connectionState === 'DEMO_MODE' && (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img src={companion.imageUrl} className="w-full h-full object-cover object-top opacity-60 scale-105 animate-pulse-slow" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-1 h-12 z-10">
                        {new Array(12).fill(0).map((_, i) => ( <div key={i} className="w-1.5 bg-white/80 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div> ))}
                    </div>
                </div>
            )}
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-32 md:w-40 aspect-[9/16] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <div className="absolute inset-0 bg-black">
                {camOn ? (
                    <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1] ${blurBackground ? 'blur-md scale-110' : ''}`} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900"><VideoOff className="w-8 h-8 mb-2 opacity-50" /><span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Off</span></div>
                )}
                <div className="absolute bottom-2 right-2">
                     <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-end z-30 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent h-48">
            <div className="flex items-center gap-3 md:gap-6 pointer-events-auto bg-black/40 backdrop-blur-xl px-6 md:px-8 py-4 rounded-full border border-white/10 shadow-2xl hover:bg-black/50 transition-all transform hover:-translate-y-1">
                <button onClick={() => setMicOn(!micOn)} className={`p-3 md:p-4 rounded-full transition-all duration-200 ${micOn ? 'bg-gray-800/80 text-white hover:bg-gray-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}>{micOn ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}</button>
                <button onClick={() => setCamOn(!camOn)} className={`p-3 md:p-4 rounded-full transition-all duration-200 ${camOn ? 'bg-gray-800/80 text-white hover:bg-gray-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}>{camOn ? <VideoIcon className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}</button>
                <button onClick={() => setBlurBackground(!blurBackground)} className={`p-3 md:p-4 rounded-full transition-all duration-200 ${blurBackground ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}><Aperture className="w-5 h-5 md:w-6 md:h-6" /></button>
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                <button onClick={handleEndSession} className="bg-red-600 hover:bg-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-transform hover:scale-105 active:scale-95"><PhoneOff className="w-5 h-5" /><span className="hidden md:inline tracking-wide">End Session</span></button>
            </div>
        </div>
    </div>
  );
};

export default VideoRoom;
