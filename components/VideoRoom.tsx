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
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 1. SET MIC TO TRUE BY DEFAULT ---
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  
  // Session State
  const [connectionState, setConnectionState] = useState<'QUEUED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('QUEUED');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Queue State
  const [queuePos, setQueuePos] = useState(0);
  const [estWait, setEstWait] = useState(0);

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
        const canJoin = Database.attemptJoinSession(userId);

        if (canJoin) {
             startTavusConnection();
        } else {
            setConnectionState('QUEUED');
            const pos = Database.getQueuePosition(userId);
            setQueuePos(pos);
            setEstWait(Database.getEstimatedWaitTime(pos));
        }
    };

    const queueInterval = setInterval(() => {
        if (connectionState === 'QUEUED') {
            const canJoin = Database.attemptJoinSession(userId);
            if (canJoin) {
                clearInterval(queueInterval);
                startTavusConnection();
            } else {
                const pos = Database.getQueuePosition(userId);
                setQueuePos(pos);
                setEstWait(Database.getEstimatedWaitTime(pos));
            }
        }
    }, 1000);

    initQueue();

    return () => {
        clearInterval(queueInterval);
        if (connectionState === 'QUEUED') {
            Database.leaveQueue(userId);
        } else if (connectionState === 'CONNECTED' || connectionState === 'DEMO_MODE') {
            Database.endSession(userId);
        }
        
        if (conversationIdRef.current) {
             endTavusConversation(conversationIdRef.current);
        }
    };
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
              throw new Error("Invalid response.");
          }

      } catch (err: any) {
          if (err.message.includes("out of credits") || err.message.includes("Billing") || err.message.includes("402")) {
              setConnectionState('DEMO_MODE');
              return;
          }
          setConnectionState('ERROR');
          setErrorMsg(err.message || "Connection Failed");
          Database.endSession(userId);
      }
  };

  // --- Webcam Logic ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 320 }, height: { ideal: 568 }, facingMode: "user" }, // Vertical Aspect
            audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Media Error", err);
      }
    };
    if (camOn) startVideo();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [camOn]);

  // --- Mic Toggle Logic ---
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = micOn;
      });
    }
  }, [micOn]);

  const handleEndSession = async () => {
      if (conversationId) await endTavusConversation(conversationId);
      Database.endSession(userId);
      onEndSession();
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none touch-none">
        
        {/* --- MAIN CONTENT AREA --- */}
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
            {connectionState === 'QUEUED' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95">
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-pulse mb-6"><Users className="w-8 h-8 text-yellow-500" /></div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">In Queue</h3>
                    <p className="text-gray-400 text-sm mb-6">Position: {queuePos} • ~{estWait}m</p>
                    <button onClick={onEndSession} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest">Cancel</button>
                </div>
            )}
            
            {connectionState === 'CONNECTING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90 backdrop-blur-md">
                    <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-6" />
                    <h3 className="text-xl font-black text-white tracking-tight">Connecting...</h3>
                </div>
            )}
            
            {connectionState === 'ERROR' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95 p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Error</h3>
                    <p className="text-gray-400 mb-6 text-sm">{errorMsg}</p>
                    <button onClick={onEndSession} className="bg-white text-black px-6 py-3 rounded-full font-bold">Close</button>
                </div>
            )}

            {connectionState === 'CONNECTED' && conversationUrl && (
                <iframe 
                    src={conversationUrl} 
                    className="absolute inset-0 w-full h-full border-0" 
                    allow="microphone; camera; autoplay *; fullscreen; display-capture; encrypted-media" 
                    title="Session" 
                />
            )}

            {connectionState === 'DEMO_MODE' && (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img src={companion.imageUrl} className="w-full h-full object-cover opacity-60 animate-pulse-slow" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                </div>
            )}
        </div>

        {/* --- DYNAMIC ISLAND (USER VIDEO) --- */}
        {/* Stationary, Top Middle, Interactive on Hover */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] group transition-all duration-300">
            <div className="relative w-[100px] h-[160px] md:w-[120px] md:h-[180px] bg-black rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
                {camOn ? (
                    /* User Video Feed */
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                ) : (
                    /* Camera Off Placeholder */
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <VideoOff className="w-6 h-6 text-gray-600" />
                    </div>
                )}

                {/* --- HIDDEN CONTROLS INSIDE THE ISLAND --- */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setMicOn(!micOn); }} 
                        className={`p-1.5 rounded-full backdrop-blur-md ${micOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {micOn ? <Mic size={12} /> : <MicOff size={12} />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCamOn(!camOn); }} 
                        className={`p-1.5 rounded-full backdrop-blur-md ${camOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {camOn ? <VideoIcon size={12} /> : <VideoOff size={12} />}
                    </button>
                </div>
            </div>
        </div>

        {/* --- SINGLE ACTION BUTTON: END SESSION --- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            <button 
                onClick={handleEndSession} 
                className="w-16 h-16 bg-red-600/90 backdrop-blur-sm hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 transition-all hover:scale-110 active:scale-95 group border border-white/10"
                title="End Session"
            >
                <PhoneOff className="w-7 h-7 group-hover:animate-pulse" />
            </button>
        </div>

    </div>
  );
};

export default VideoRoom;
