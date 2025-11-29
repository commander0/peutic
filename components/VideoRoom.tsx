import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, RefreshCcw, Users
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

  // Credit Tracking
  const userId = useRef(`user_${Date.now()}`).current;

  // Sync state to ref
  useEffect(() => {
      conversationIdRef.current = conversationId;
  }, [conversationId]);

  // --- Browser/Tab Close Cleanup ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (conversationIdRef.current) endTavusConversation(conversationIdRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
        if (connectionState === 'QUEUED') Database.leaveQueue(userId);
        else if (connectionState === 'CONNECTED' || connectionState === 'DEMO_MODE') Database.endSession(userId);
        
        if (conversationIdRef.current) endTavusConversation(conversationIdRef.current);
    };
  }, []);

  const startTavusConnection = async () => {
      setConnectionState('CONNECTING');
      setErrorMsg('');
      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) throw new Error("Insufficient Credits.");
          
          if (!companion.replicaId) throw new Error("Invalid Configuration");

          const context = `You are ${companion.name}, a specialist in ${companion.specialty}. Bio: ${companion.bio}. User: ${userName}. Be professional.`;
          const response = await createTavusConversation(companion.replicaId, userName, context);
          
          if (response.conversation_url) {
               setConversationUrl(response.conversation_url);
               setConversationId(response.conversation_id);
               setConnectionState('CONNECTED');
          } else {
              throw new Error("Connection failed.");
          }
      } catch (err: any) {
          if (err.message.includes("Credits") || err.message.includes("402")) {
              setConnectionState('DEMO_MODE');
              return;
          }
          setConnectionState('ERROR');
          setErrorMsg(err.message || "Connection Error");
          Database.endSession(userId);
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
      } catch (err) {
        console.error("Media Error", err);
      }
    };
    if (camOn) startVideo();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [camOn]);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = micOn);
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
                <div className="flex flex-col items-center justify-center z-10 text-center p-6">
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-pulse mb-4"><Users className="w-6 h-6 text-yellow-500" /></div>
                    <h3 className="text-2xl font-black text-white mb-2">In Queue</h3>
                    <p className="text-gray-400 text-sm">Position: {queuePos} • ~{estWait}m wait</p>
                    <button onClick={onEndSession} className="mt-8 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest">Cancel</button>
                </div>
            )}
            
            {connectionState === 'CONNECTING' && (
                <div className="flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Connecting...</p>
                </div>
            )}
            
            {connectionState === 'ERROR' && (
                <div className="flex flex-col items-center justify-center z-10 text-center p-6">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <p className="text-white font-bold mb-6">{errorMsg}</p>
                    <button onClick={onEndSession} className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm">Close</button>
                </div>
            )}

            {connectionState === 'CONNECTED' && conversationUrl && (
                <iframe 
                    src={conversationUrl} 
                    className="absolute inset-0 w-full h-full border-0 animate-in fade-in duration-1000" 
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

        {/* --- THE "CUTOUT" (USER VIDEO) - STATIONARY TOP MIDDLE --- */}
        {/* Only visible if connected/demo/queued to verify camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] w-24 md:w-32 aspect-[3/4] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-black group transition-all hover:scale-105 hover:border-white/30 hover:shadow-yellow-500/10">
            {camOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm"><VideoOff className="w-5 h-5 text-gray-500" /></div>
            )}
            
            {/* MINI CONTROLS (Inside the cutout) */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button onClick={(e) => { e.stopPropagation(); setMicOn(!micOn); }} className={`p-1.5 rounded-full ${micOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                    {micOn ? <Mic size={10} /> : <MicOff size={10} />}
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); setCamOn(!camOn); }} className={`p-1.5 rounded-full ${camOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                    {camOn ? <VideoIcon size={10} /> : <VideoOff size={10} />}
                 </button>
            </div>
        </div>

        {/* --- SINGLE END BUTTON (Bottom Center) --- */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
            <button 
                onClick={handleEndSession} 
                className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 transition-all hover:scale-110 active:scale-95 group"
            >
                <PhoneOff className="w-6 h-6 group-hover:animate-pulse" />
            </button>
        </div>

    </div>
  );
};

export default VideoRoom;
