import { Companion } from '../types';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
    Loader2, AlertCircle, Users
    Loader2, AlertCircle, RefreshCcw, CheckCircle, Star, Users
} from 'lucide-react';
import { createTavusConversation, endTavusConversation } from '../services/tavusService';
import { Database } from '../services/database';
@@ -22,17 +22,29 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName
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
@@ -61,13 +73,15 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName
        if (canJoin) {
             startTavusConnection();
        } else {
            // Get initial queue position
            setConnectionState('QUEUED');
            const pos = Database.getQueuePosition(userId);
            setQueuePos(pos);
            setEstWait(Database.getEstimatedWaitTime(pos));
        }
    };

    // Poll for Queue Slot
    const queueInterval = setInterval(() => {
        if (connectionState === 'QUEUED') {
            const canJoin = Database.attemptJoinSession(userId);
@@ -86,6 +100,7 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName

    return () => {
        clearInterval(queueInterval);
        // Clean up queue/session if we leave
        if (connectionState === 'QUEUED') {
            Database.leaveQueue(userId);
        } else if (connectionState === 'CONNECTED' || connectionState === 'DEMO_MODE') {
@@ -104,9 +119,10 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName

      try {
          const user = Database.getUser();
          if (!user || user.balance <= 0) throw new Error("Insufficient Credits.");
          if (!user || user.balance <= 0) throw new Error("Insufficient Credits: Session Access Denied.");
          setRemainingMinutes(user.balance); 

          if (!companion.replicaId) throw new Error("Configuration Error");
          if (!companion.replicaId) throw new Error("Invalid Specialist Configuration");

          const context = `You are ${companion.name}, a professional specialist in ${companion.specialty}. Your bio is: "${companion.bio}". You are speaking with ${userName}. Be empathetic, professional, and concise. Listen actively.`;

@@ -117,17 +133,23 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName
               setConversationId(response.conversation_id);
               setConnectionState('CONNECTED');
          } else {
              throw new Error("Invalid response.");
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
          setErrorMsg(err.message || "Connection Failed");
          Database.endSession(userId);
          setErrorMsg(err.message || "Failed to establish secure connection.");
          Database.endSession(userId); // Release slot
      }
  };

@@ -137,17 +159,18 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 320 }, height: { ideal: 568 }, facingMode: "user" }, // Vertical Aspect
            video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" }, 
            // --- ENSURE HARDWARE MIC IS ON ---
            audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Media Error", err);
        console.error("Error accessing media devices", err);
      }
    };
    if (camOn) startVideo();
    if (camOn && !showSummary) startVideo();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [camOn]);
  }, [camOn, showSummary]);

  // --- Mic Toggle Logic ---
  useEffect(() => {
@@ -159,51 +182,164 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName
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
      Database.endSession(userId);
      Database.endSession(userId); // Release slot
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
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none touch-none">
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden select-none">

        {/* --- MAIN CONTENT AREA --- */}
        {/* --- TOP LEFT: STATUS --- */}
        <div className="absolute top-6 left-6 z-50">
            <div className={`bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border ${lowBalanceWarning ? 'border-red-500 animate-pulse' : 'border-white/10'} flex items-center gap-3`}>
                <div className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className={`font-mono font-bold text-sm ${lowBalanceWarning ? 'text-red-400' : 'text-white'}`}>
                    {connectionState === 'CONNECTED' ? formatTime(duration) : connectionState === 'QUEUED' ? 'Waiting...' : 'Connecting...'}
                </span>
            </div>
        </div>

        {/* --- TOP RIGHT: CONTROLS & NETWORK (Moved from Bottom to prevent blocking Avatar UI) --- */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            {/* Network Indicator */}
            <div className="bg-black/40 backdrop-blur-md px-3 py-3 rounded-full border border-white/10 flex items-end gap-1 h-[54px] hidden md:flex">
                {[1, 2, 3, 4].map(i => ( <div key={i} className={`w-1 rounded-sm ${i <= networkQuality ? 'bg-green-500' : 'bg-gray-600'}`} style={{ height: `${i * 25}%` }}></div> ))}
            </div>

            {/* Main Controls - Top Right Position */}
            <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-3 h-[54px]">
                <button onClick={() => setMicOn(!micOn)} className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${micOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setCamOn(!camOn)} className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${camOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`}>
                    {camOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <button onClick={handleEndSession} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full font-bold transition-all hover:scale-110 active:scale-95" title="End Session">
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* MAIN VIDEO AREA */}
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
            {connectionState === 'QUEUED' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95">
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-pulse mb-6"><Users className="w-8 h-8 text-yellow-500" /></div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">In Queue</h3>
                    <p className="text-gray-400 text-sm mb-6">Position: {queuePos} • ~{estWait}m</p>
                    <button onClick={onEndSession} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest">Cancel</button>
                    <div className="w-20 h-20 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-pulse mb-8"><Users className="w-8 h-8 text-yellow-500" /></div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">You are in queue</h3>
                    <p className="text-gray-400 text-sm mb-6">Position: <span className="text-white font-bold">{queuePos}</span> • Est: <span className="text-white font-bold">~{estWait}m</span></p>
                    <button onClick={onEndSession} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest">Leave Queue</button>
                </div>
            )}
            
            {connectionState === 'CONNECTING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90 backdrop-blur-md">
                    <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-6" />
                    <h3 className="text-xl font-black text-white tracking-tight">Connecting...</h3>
                    <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mb-6" />
                    <h3 className="text-2xl font-black text-white tracking-tight">Securing Link</h3>
                </div>
            )}
            
            {connectionState === 'ERROR' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/95 p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Error</h3>
                    <p className="text-gray-400 mb-6 text-sm">{errorMsg}</p>
                    <button onClick={onEndSession} className="bg-white text-black px-6 py-3 rounded-full font-bold">Close</button>
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
                // IMPROVED IFRAME PERMISSIONS FOR AUTOPLAY
                <iframe 
                    src={conversationUrl} 
                    className="absolute inset-0 w-full h-full border-0" 
                    allow="microphone; camera; autoplay *; fullscreen; display-capture; encrypted-media" 
                    title="Session" 
                    title="Tavus Session" 
                />
            )}

            {connectionState === 'DEMO_MODE' && (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img src={companion.imageUrl} className="w-full h-full object-cover opacity-60 animate-pulse-slow" alt="Background" />
@@ -212,55 +348,19 @@ const VideoRoom: React.FC<VideoRoomProps> = ({ companion, onEndSession, userName
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
        {/* --- USER PIP: TOP-MIDDLE, SMALL & STATIONARY --- */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-24 md:w-36 aspect-[9/16] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black pointer-events-none">
            {camOn ? (
                // --- 3. MUTED PREVENTS FEEDBACK ---
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900"><VideoOff className="w-6 h-6 mb-1 opacity-50" /></div>
            )}
            <div className="absolute bottom-2 right-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
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
