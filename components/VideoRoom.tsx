import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, Users, Wifi
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
  
  // Media State - Default Mic ON for immediate conversation
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  
  // Session State
  const [connectionState, setConnectionState] = useState<'QUEUED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('QUEUED');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Queue Data
  const [queuePos, setQueuePos] = useState(0);
  const [estWait, setEstWait] = useState(0);

  const userId = useRef(`user_${Date.now()}`).current;

  // Sync Refs
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

  // --- Cleanup ---
  useEffect(() => {
    const handleBeforeUnload = () => {
        if (conversationIdRef.current) endTavusConversation(conversationIdRef.current);
        Database.endSession(userId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // --- Queue & Connection Logic ---
  useEffect(() => {
    const initSession = () => {
        const canJoin = Database.attemptJoinSession(userId);
        if (canJoin) {
             startTavusConnection();
        } else {
            setConnectionState('QUEUED');
            updateQueueStats();
        }
    };

    const updateQueueStats = () => {
        const pos = Database.getQueuePosition(userId);
        setQueuePos(pos);
        setEstWait(Database.getEstimatedWaitTime(pos));
    };

    const queueInterval = setInterval(() => {
        if (connectionState === 'QUEUED') {
            const canJoin = Database.attemptJoinSession(userId);
            if (canJoin) {
                clearInterval(queueInterval);
                startTavusConnection();
            } else {
                updateQueueStats();
            }
        }
    }, 1000);

    initSession();

    return () => {
        clearInterval(queueInterval);
        if (connectionState === 'QUEUED') Database.leaveQueue(userId);
        else if (connectionState === 'CONNECTED' || connectionState === 'DEMO_MODE') Database.endSession(userId);
        if (conversationIdRef.current) endTavusConversation(conversationIdRef.current);
    };
  }, []);

  const startTavusConnection = async () => {
      setConnectionState('CONNECTING');
      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) throw new Error("Insufficient Credits");

          if (!companion.replicaId) throw new Error("Configuration Error");

          const context = `You are ${companion.name}, a specialist in ${companion.specialty}. User: ${userName}. Be professional and empathetic.`;
          const response = await createTavusConversation(companion.replicaId, userName, context);
          
          if (response.conversation_url) {
               setConversationUrl(response.conversation_url);
               setConversationId(response.conversation_id);
               setConnectionState('CONNECTED');
          } else {
              throw new Error("Connection Failed");
          }
      } catch (err: any) {
          if (err.message.includes("402") || err.message.includes("credits")) {
              setConnectionState('DEMO_MODE'); // Fallback for demo
          } else {
              setConnectionState('ERROR');
              setErrorMsg(err.message || "Connection Failed");
              Database.endSession(userId);
          }
      }
  };

  // --- Hardware Access ---
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 480 }, height: { ideal: 640 }, facingMode: "user" }, 
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
      Database.endSession(userId);
      onEndSession();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden touch-none h-[100dvh]">
        
        {/* --- BACKGROUND LAYER (AVATAR) --- */}
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
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 z-20">
                    {connectionState === 'QUEUED' && (
                        <div className="animate-in zoom-in duration-300">
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full flex items-center justify-center bg-black">
                                    <Users className="w-10 h-10 text-yellow-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2">In Queue</h3>
                            <p className="text-gray-400 text-lg mb-8 font-medium">Position <span className="text-white font-bold">{queuePos}</span> • {estWait}m wait</p>
                            <button onClick={onEndSession} className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Cancel Request</button>
                        </div>
                    )}

                    {connectionState === 'CONNECTING' && (
                        <div className="animate-in fade-in duration-500">
                            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white tracking-tight">Establishing Secure Link...</h3>
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

        {/* --- DYNAMIC ISLAND (USER FEED + CONTROLS) --- */}
        {/* Top Center - Stationary - Contains User Video & Hidden Controls */}
        <div 
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 group"
            onMouseEnter={() => setControlsVisible(true)}
            onMouseLeave={() => setControlsVisible(false)}
            onClick={() => setControlsVisible(!controlsVisible)} // Toggle for mobile touch
        >
            <div className="relative w-[120px] h-[180px] md:w-[140px] md:h-[210px] bg-black rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-white/30 hover:shadow-yellow-500/10">
                
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
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                            <Users className="w-6 h-6 text-gray-500" />
                        </div>
                    </div>
                )}

                {/* Status Dot (Always Visible) */}
                <div className={`absolute top-3 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full z-20 transition-colors ${micOn ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>

                {/* Integrated Controls (Visible on Interaction) */}
                <div className={`absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center gap-3 pb-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
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
            >
                <div className="absolute inset-0 rounded-full border border-white/20"></div>
                <PhoneOff className="w-7 h-7 fill-current" />
            </button>
        </div>

    </div>
  );
};

export default VideoRoom;
