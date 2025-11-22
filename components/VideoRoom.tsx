
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
    // ONLY Start timer if Connected or Demo Mode
    if (connectionState !== 'CONNECTED' && connectionState !== 'DEMO_MODE') return;

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
  }, [showSummary, remainingMinutes, connectionState]);

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

  const formatTime = (