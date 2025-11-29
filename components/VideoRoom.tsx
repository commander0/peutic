import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, Users
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
  
  // Media State - Mic defaults to TRUE
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  
  // Session State
  const [connectionState, setConnectionState] = useState<'QUEUED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('QUEUED');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Refs for cleanup & interval tracking
  const conversationIdRef = useRef<string | null>(null);
  const connectionStateRef = useRef(connectionState); // To access state inside interval
  const userId = useRef(`user_${Date.now()}`).current;

  // Queue Data
  const [queuePos, setQueuePos] = useState(0);
  const [estWait, setEstWait] = useState(0);

  // Sync Refs
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
  useEffect(() => { connectionStateRef.current = connectionState; }, [connectionState]);

  // --- Cleanup on Unmount/Refresh ---
  useEffect(() => {
    const handleBeforeUnload = () => {
        if (conversationIdRef.current) endTavusConversation(conversationIdRef.current);
        Database.endSession(userId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Ensure we leave queue/session on component unmount
        const state = connectionStateRef.current;
        if (state === 'QUEUED') Database.leaveQueue(userId);
        if (state === 'CONNECTED' || state === 'DEMO_MODE') Database.endSession(userId);
    };
  }, []);

  // --- Queue & Session Logic ---
  useEffect(() => {
    const initQueue = () => {
        // 1. Try to join immediately (Round Robin Check)
        const canJoin = Database.attemptJoinSession(userId);
        
        if (canJoin) {
             startTavusConnection();
        } else {
            // 2. If full, set to Queued and update stats
            setConnectionState('QUEUED');
            const pos = Database.getQueuePosition(userId);
            setQueuePos(pos);
            setEstWait(Database.getEstimatedWaitTime(pos));
        }
    };

    // 3. Poll for Open Slot
    const queueInterval = setInterval(() => {
        if (connectionStateRef.current === 'QUEUED') {
            const canJoin = Database.attemptJoinSession(userId);
            if (canJoin) {
                // Slot found!
                clearInterval(queueInterval);
                startTavusConnection();
            } else {
                // Still waiting, update numbers
                const pos = Database.getQueuePosition(userId);
                setQueuePos(pos);
                setEstWait(Database.getEstimatedWaitTime(pos));
            }
        } else {
            // If state changed (e.g. to CONNECTING), stop polling
            clearInterval(queueInterval);
        }
    }, 1000);

    initQueue();

    return () => clearInterval(queueInterval);
  }, []);

  const startTavusConnection = async () => {
      setConnectionState('CONNECTING');
      setErrorMsg('');
      
      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) throw new Error("Insufficient Credits.");

          if (!companion.replicaId) throw new Error("Configuration Error");

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
          if (err.message.includes("out of credits") || err.message.includes("402")) {
              // Fallback to demo if billing fails
              console.warn("Billing limit reached, switching to demo.");
              setConnectionState('DEMO_MODE');
          } else {
              setConnectionState('ERROR');
              setErrorMsg(err.message || "Connection Failed");
              Database.endSession(userId); // Release the slot if we failed
          }
      }
  };

  // --- Hardware Access ---
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 320 }, height: { ideal: 480 }, facingMode: "user" }, 
            audio: true // Mic MUST be requested as TRUE here
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Media Access Error", err);
      }
    };
    if (camOn) startVideo();
  }, [camOn]);

  // Sync Mic State with Stream
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getAudioTracks().forEach(track => track.enabled = micOn);
    }
  }, [micOn]);

  const handleEndSession = async () => {
      if (conversationId) await endTavusConversation(conversationId);
      Database.endSession(userId); // IMPORTANT: Release slot for next user in queue
      onEndSession();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden touch-none h-[100dvh]">
        
        {/* --- BACKGROUND LAYER (AVATAR OR STATUS) --- */}
        <div className="absolute inset-0 w-full h-full bg-gray-900">
            {connectionState === 'CONNECTED' && conversationUrl && (
                <iframe 
                    src={conversationUrl} 
                    className="w-full h-full border-0 animate-in fade-in duration-1000 object-cover"
                    allow="microphone; camera; autoplay *; fullscreen; display-capture; encrypted-media" 
                />
            )}
            
            {connectionState === 'DEMO_MODE' && (
                <>
                    <img src={companion.imageUrl} className="w-full h-full object-cover opacity-80" alt="Avatar" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                </>
            )}

            {/* Queue / Loading States Overlay */}
            {(connectionState === 'QUEUED' || connectionState === 'CONNECTING' || connectionState === 'ERROR') && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 z-20">
                    {connectionState === 'QUEUED' && (
                        <div className="animate-in zoom-in duration-300">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full flex items-center justify-center bg-black">
                                    <Users className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">You are in Queue</h3>
                            <p className="text-gray-400 text-sm mb-8 font-medium">Position <span className="text-white font-bold text-lg">{queuePos}</span> • Approx {estWait}m wait</p>
                            <button onClick={onEndSession} className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white pb-1">Cancel Request</button>
                        </div>
                    )}

                    {connectionState === 'CONNECTING' && (
                        <div className="animate-in fade-in duration-500">
                            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white tracking-tight">Connecting to {companion.name}...</h3>
                        </div>
                    )}

                    {connectionState === 'ERROR' && (
                        <div className="max-w-xs">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-white font-bold mb-6">{errorMsg}</p>
                            <button onClick={onEndSession} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Close</button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- DYNAMIC ISLAND (USER VIDEO + CONTROLS) --- */}
        {/* Top Center - Stationary - Contains User Video & Hidden Controls */}
        <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 group"
            onMouseEnter={() => setControlsVisible(true)}
            onMouseLeave={() => setControlsVisible(false)}
            onClick={() => setControlsVisible(!controlsVisible)} // Toggle for mobile touch
        >
            <div className="relative w-[110px] h-[170px] md:w-[130px] md:h-[200px] bg-black rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-white/30 hover:shadow-yellow-500/10">
                
                {/* User Video Feed */}
                {camOn ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted // CRITICAL: Muted prevents feedback, but stream has audio enabled
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                            <VideoOff className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                )}

                {/* Status Dot (Always Visible) */}
                <div className={`absolute top-3 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full z-20 transition-colors ${micOn ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>

                {/* Integrated Controls (Visible on Interaction) */}
                <div className={`absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center gap-3 pb-3 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setMicOn(!micOn); }} 
                        className={`p-2 rounded-full backdrop-blur-xl transition-transform active:scale-90 ${micOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCamOn(!camOn); }} 
                        className={`p-2 rounded-full backdrop-blur-xl transition-transform active:scale-90 ${camOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {camOn ? <VideoIcon size={14} /> : <VideoOff size={14} />}
                    </button>
                </div>
            </div>
        </div>

        {/* --- PRIMARY ACTION: END CALL --- */}
        {/* Floating at bottom center */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
            <button 
                onClick={handleEndSession} 
                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-red-600 text-white shadow-lg shadow-red-900/40 transition-all duration-300 hover:scale-110 hover:bg-red-500 active:scale-95"
                title="End Session"
            >
                <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-white/40"></div>
                <PhoneOff className="w-7 h-7 fill-current" />
            </button>
        </div>

    </div>
  );
};

export default VideoRoom;
