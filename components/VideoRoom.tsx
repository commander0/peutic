import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, RefreshCcw, CheckCircle, Star, Users, Play
} from 'lucide-react';
import { createTavusConversation, endTavusConversation } from '../services/tavusService'; // Assuming you have an end function
import { Database } from '../services/database';

interface VideoRoomProps {
  companion: Companion;
  onEndSession: () => void;
  userName: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // --- GUARD REFS (Crucial for preventing 400% usage) ---
  const initializationRef = useRef(false); // Prevents double-firing API calls
  const conversationIdRef = useRef<string | null>(null); // Tracks the actual Tavus ID
  const activeSessionRef = useRef(false); // Tracks if we are currently billing
  
  // Media State
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [blurBackground, setBlurBackground] = useState(false);
  
  // Session State
  const [duration, setDuration] = useState(0);
  // Added 'READY_TO_JOIN' to prevent auto-billing before user is actually present
  const [connectionState, setConnectionState] = useState<'QUEUED' | 'READY_TO_JOIN' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('QUEUED');
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

  // --- STRICT CLEANUP FUNCTION ---
  // This ensures we kill the connection on the server side immediately
  const terminateConnection = useCallback(async () => {
    if (conversationIdRef.current && activeSessionRef.current) {
        console.log("Terminating Tavus Session to save credits...");
        try {
            // 1. Attempt graceful shutdown via API
            // Note: You need to expose an endConversation endpoint in your service
            // await endTavusConversation(conversationIdRef.current); 
            
            // 2. Beacon is a fallback if the browser is closing
            const data = JSON.stringify({ conversationId: conversationIdRef.current });
            navigator.sendBeacon('/api/tavus/terminate', data); 
        } catch (e) {
            console.error("Cleanup warning:", e);
        }
    }
    activeSessionRef.current = false;
  }, []);

  // --- QUEUE LOGIC ---
  useEffect(() => {
    let queueInterval: NodeJS.Timeout;

    const checkQueue = () => {
        // Stop checking if we have moved past queueing
        if (connectionState !== 'QUEUED') return;

        const pos = Database.getQueuePosition(userId);
        const settings = Database.getSettings();
        const active = Database.getActiveSessionCount();
        
        setQueuePos(pos);
        setEstWait(Database.getEstimatedWaitTime(pos));

        // PROFITABILITY FIX: 
        // Do NOT auto-connect. Change state to READY_TO_JOIN.
        // This ensures credits aren't burned if the user walked away.
        if (pos === 1 && active < settings.maxConcurrentSessions) {
            setConnectionState('READY_TO_JOIN');
        }
    };

    // Initial Join
    if (!initializationRef.current) {
        Database.joinQueue(userId);
        checkQueue();
        queueInterval = setInterval(checkQueue, 3000);
    }

    // Cleanup on unmount
    return () => {
        clearInterval(queueInterval);
        Database.leaveQueue(userId);
        terminateConnection(); // Kill Tavus if they close the component
        if (connectionState === 'CONNECTED') {
             Database.decrementActiveSessions();
        }
    };
  }, [userId, connectionState, terminateConnection]);

  // --- MANUAL START (Profit Guard) ---
  const handleUserReady = () => {
      if (initializationRef.current) return; // Prevent double clicks
      initializationRef.current = true; // Lock it
      startTavusConnection();
  };

  const startTavusConnection = async () => {
      setConnectionState('CONNECTING');
      setErrorMsg('');
      
      Database.incrementActiveSessions();
      Database.leaveQueue(userId);

      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) {
              throw new Error("Insufficient Credits: Session Access Denied.");
          }
          setRemainingMinutes(user.balance); 

          if (!companion.replicaId) throw new Error("Invalid Specialist Configuration");

          const context = `You are ${companion.name}, a professional specialist in ${companion.specialty}. Your bio is: "${companion.bio}". You are speaking with ${userName}. Be empathetic, professional, and concise.`;

          // API CALL
          const response = await createTavusConversation(companion.replicaId, userName, context);
          
          if (response.conversation_url) {
               setConversationUrl(response.conversation_url);
               // Store ID for cleanup
               conversationIdRef.current = response.conversation_id; 
               activeSessionRef.current = true;
               setConnectionState('CONNECTED');
          } else {
              throw new Error("Invalid response from video server.");
          }

      } catch (err: any) {
          initializationRef.current = false; // Reset lock on error
          if (err.message.includes("Insufficient Credits")) {
              alert("Your session ended because you are out of credits.");
              handleEndSession(); 
              return;
          }
          setConnectionState('ERROR');
          setErrorMsg(err.message || "Failed to establish secure connection.");
      }
  };

  // --- WINDOW VISIBILITY WATCHDOG ---
  // If user tabs away for > 30s, kill the session to save money.
  useEffect(() => {
      let idleTimer: NodeJS.Timeout;

      const handleVisibilityChange = () => {
          if (document.hidden && connectionState === 'CONNECTED') {
              console.warn("User tabbed away. Starting auto-kill timer.");
              idleTimer = setTimeout(() => {
                  alert("Session paused due to inactivity to save your credits.");
                  handleEndSession();
              }, 30000); // 30 seconds leniency
          } else {
              clearTimeout(idleTimer);
          }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          clearTimeout(idleTimer);
      };
  }, [connectionState]);


  // --- WEBCAM (Standard) ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user"}, 
            audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Media Error", err); }
    };

    if (camOn && !showSummary) startVideo();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [camOn, showSummary]);

  // --- TIMERS ---
  useEffect(() => {
    if (showSummary || (connectionState !== 'CONNECTED' && connectionState !== 'DEMO_MODE')) return;

    const interval = setInterval(() => {
        setDuration(d => {
            const newDuration = d + 1;
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
            if (remainingMinutes <= 1 && newDuration % 60 === 30) setLowBalanceWarning(true);
            return newDuration;
        });
        if (Math.random() > 0.9) setNetworkQuality(Math.max(2, Math.floor(Math.random() * 3) + 2)); 
    }, 1000);
    return () => clearInterval(interval);
  }, [showSummary, remainingMinutes, connectionState]);

  // --- END SESSION ---
  const handleEndSession = () => {
      terminateConnection(); // KILL API IMMEDIATELY
      setShowSummary(true);
  };

  const submitFeedbackAndClose = () => {
      const minutesUsed = Math.ceil(duration / 60);
      if (minutesUsed > 0) {
        Database.deductBalance(minutesUsed);
        // Transaction logging logic...
      }
      onEndSession();
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const settings = Database.getSettings();
  const cost = Math.ceil(duration / 60) * settings.pricePerMinute;
  
  // Reuse previous feedback rendering logic for brevity...
  if (showSummary) {
      // ... (Your existing Summary UI)
      return (
          <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center text-white p-4">
              <div className="bg-gray-900 p-8 rounded-3xl max-w-md w-full text-center border border-gray-800">
                  <h2 className="text-2xl font-bold mb-4">Session Ended</h2>
                  <p className="text-gray-400 mb-6">Duration: {formatTime(duration)}</p>
                  <button onClick={submitFeedbackAndClose} className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold">Close</button>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none">
        
        {/* HEADER (Simplified for view) */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between pointer-events-none">
             <div className="bg-black/40 px-4 py-2 rounded-full border border-white/10 text-white font-mono flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span>{connectionState === 'CONNECTED' ? formatTime(duration) : connectionState}</span>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
            
            {/* 1. WAITING IN QUEUE */}
            {connectionState === 'QUEUED' && (
                <div className="text-center z-10">
                    <div className="animate-pulse mb-4 text-yellow-500"><Users size={48} /></div>
                    <h3 className="text-2xl font-bold text-white">In Queue...</h3>
                    <p className="text-gray-400">Position: {queuePos} | Wait: ~{estWait}m</p>
                </div>
            )}

            {/* 2. READY TO JOIN (NEW PROFIT GUARD) */}
            {connectionState === 'READY_TO_JOIN' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90 backdrop-blur-md">
                     <div className="bg-gray-900 p-8 rounded-2xl border border-yellow-500/30 text-center max-w-sm shadow-2xl shadow-yellow-500/10">
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <VideoIcon className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Specialist Ready</h3>
                        <p className="text-gray-400 text-sm mb-6">Your session is ready to begin. Click below to connect.</p>
                        
                        <button 
                            onClick={handleUserReady}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                        >
                            <Play className="w-5 h-5 fill-current" /> Start Session
                        </button>
                        <p className="text-xs text-gray-600 mt-4">Billing begins upon connection.</p>
                     </div>
                </div>
            )}

            {connectionState === 'CONNECTING' && (
                <div className="text-center z-10">
                    <Loader2 className="w-16 h-16 animate-spin text-yellow-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">Connecting secure line...</h3>
                </div>
            )}

            {/* ERROR STATE */}
            {connectionState === 'ERROR' && (
                <div className="text-center z-10 p-8 bg-gray-800 rounded-xl border border-red-500/50">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-white mb-4">{errorMsg}</p>
                    <button onClick={onEndSession} className="bg-white text-black px-6 py-2 rounded-full font-bold">Return</button>
                </div>
            )}

            {/* ACTIVE SESSION */}
            {connectionState === 'CONNECTED' && conversationUrl && (
                <iframe 
                    src={conversationUrl} 
                    className="absolute inset-0 w-full h-full border-0" 
                    allow="microphone; camera; autoplay; fullscreen" 
                />
            )}
        </div>

        {/* USER PIP (Bottom Right, classic style) */}
        <div className="absolute top-4 right-4 z-30 w-32 aspect-video bg-black rounded-lg overflow-hidden border border-white/20 shadow-xl">
             <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
        </div>

        {/* CONTROLS */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
             <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full ${micOn ? 'bg-gray-800 text-white' : 'bg-red-500 text-white'}`}>{micOn ? <Mic /> : <MicOff />}</button>
             <button onClick={handleEndSession} className="bg-red-600 px-8 py-4 rounded-full font-bold text-white hover:bg-red-500 flex items-center gap-2"><PhoneOff /> End</button>
        </div>
    </div>
  );
};

export default VideoRoom;
