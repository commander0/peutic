
import React, { useEffect, useRef, useState } from 'react';
import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2, 
    AlertCircle, RefreshCcw, CheckCircle, Star, AlertTriangle, Maximize2, Minimize2, GripHorizontal, Aperture
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
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [blurBackground, setBlurBackground] = useState(false);
  const [duration, setDuration] = useState(0);
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DEMO_MODE'>('CONNECTING');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPipExpanded, setIsPipExpanded] = useState(false);

  useEffect(() => {
    const init = async () => {
        setConnectionState('CONNECTING');
        try {
            const user = Database.getUser();
            if (!user || user.balance <= 0) throw new Error("Insufficient Credits.");
            setRemainingMinutes(user.balance);
            const context = `You are ${companion.name}, a specialist in ${companion.specialty}. Speak with ${userName}.`;
            const res = await createTavusConversation(companion.replicaId, userName, context);
            if (res.conversation_url) {
                setConversationUrl(res.conversation_url);
                setConnectionState('CONNECTED');
            }
        } catch (e: any) {
            if (e.message.includes("credits")) setConnectionState('DEMO_MODE');
            else { setConnectionState('ERROR'); setErrorMsg(e.message); }
        }
    };
    init();
  }, []);

  useEffect(() => {
      if (showSummary) return;
      if (connectionState !== 'CONNECTED' && connectionState !== 'DEMO_MODE') return;

      const interval = setInterval(() => {
          setDuration(d => {
              const next = d + 1;
              if (next % 60 === 0) {
                  setRemainingMinutes(prev => {
                      const newVal = prev - 1;
                      if (newVal <= 0) { handleEndSession(); return 0; }
                      return newVal;
                  });
              }
              if (remainingMinutes <= 1 && next % 60 === 30) setLowBalanceWarning(true);
              return next;
          });
      }, 1000);
      return () => clearInterval(interval);
  }, [connectionState, remainingMinutes, showSummary]);

  useEffect(() => {
      if (!camOn || showSummary) return;
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
          .catch(console.error);
  }, [camOn, showSummary]);

  const handleEndSession = () => {
      setShowSummary(true);
      const minutesUsed = Math.ceil(duration / 60);
      if (minutesUsed > 0 && connectionState === 'CONNECTED') {
          Database.deductBalance(minutesUsed);
          Database.addTransaction({
              id: `sess_${Date.now()}`,
              userName,
              date: new Date().toISOString(),
              amount: -minutesUsed,
              description: `Session with ${companion.name}`,
              status: 'COMPLETED'
          });
      }
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const handleDrag = (e: any) => {
      if (!isDragging || !containerRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = containerRef.current.getBoundingClientRect();
      setPipPosition({
          x: Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)),
          y: Math.min(95, Math.max(5, ((clientY - rect.top) / rect.height) * 100))
      });
  };

  if (showSummary) {
      return (
          <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center text-white p-4">
              <div className="bg-gray-900 p-8 rounded-3xl max-w-md w-full text-center border border-gray-800">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Session Complete</h2>
                  <p className="text-gray-400 mb-6">Duration: {formatTime(duration)}</p>
                  <button onClick={onEndSession} className="bg-yellow-500 text-black w-full py-3 rounded-xl font-bold">Return to Dashboard</button>
              </div>
          </div>
      );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col" onMouseMove={handleDrag} onMouseUp={() => setIsDragging(false)} onTouchMove={handleDrag} onTouchEnd={() => setIsDragging(false)}>
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-mono pointer-events-auto">
                <span className="text-green-400 mr-2">●</span>
                {connectionState === 'CONNECTED' ? formatTime(duration) : 'Connecting...'}
            </div>
            {lowBalanceWarning && (
                <div className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold animate-pulse shadow-lg shadow-red-900/50 pointer-events-auto">
                    <AlertTriangle className="inline w-5 h-5 mr-2" /> 30 Seconds Remaining
                </div>
            )}
        </div>
        <div className="flex-1 bg-gray-900 relative">
            {connectionState === 'CONNECTED' && conversationUrl ? (
                <iframe src={conversationUrl} className="w-full h-full border-0" allow="camera; microphone; autoplay" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    {connectionState === 'CONNECTING' && <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />}
                    {connectionState === 'ERROR' && <div className="text-white text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" /><p>{errorMsg}</p><button onClick={onEndSession} className="mt-4 underline">Go Back</button></div>}
                    {connectionState === 'DEMO_MODE' && <img src={companion.imageUrl} className="w-full h-full object-cover opacity-50" />}
                </div>
            )}
        </div>
        <div className={`absolute z-30 bg-black rounded-xl overflow-hidden border border-white/20 shadow-2xl cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`} style={{ left: `${pipPosition.x}%`, top: `${pipPosition.y}%`, width: isPipExpanded ? 240 : 120, height: isPipExpanded ? 320 : 160, transform: 'translate(-50%, -50%)', transition: isDragging ? 'none' : 'all 0.2s' }} onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)}>
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${blurBackground ? 'blur-sm' : ''}`} />
            <button onClick={(e) => {e.stopPropagation(); setIsPipExpanded(!isPipExpanded)}} className="absolute top-2 right-2 text-white bg-black/50 rounded p-1"><Maximize2 className="w-3 h-3" /></button>
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-xl p-4 rounded-full border border-white/10 flex gap-4 pointer-events-auto">
                <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-full ${micOn ? 'bg-gray-700' : 'bg-red-500'}`}>{micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}</button>
                <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-full ${camOn ? 'bg-gray-700' : 'bg-red-500'}`}>{camOn ? <VideoIcon className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}</button>
                <button onClick={handleEndSession} className="px-6 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold flex items-center gap-2">End Call</button>
            </div>
        </div>
    </div>
  );
};

export default VideoRoom;
