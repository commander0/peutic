
import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { Heart, Lock, Mail, ArrowRight, Check, Facebook, AlertCircle, Key, RefreshCcw, ChevronRight, Calendar, User, X as XIcon, Shield } from 'lucide-react';
import { Database } from '../services/database';

interface AuthProps {
  onLogin: (role: UserRole, name: string, avatar?: string, email?: string, birthday?: string) => void;
  onCancel: () => void;
}

declare global {
    interface Window {
        google?: any;
    }
}

const Auth: React.FC<AuthProps> = ({ onLogin, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Signup Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');

  const [loading, setLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Reset State
  const [resetStep, setResetStep] = useState(0); // 0: Email, 1: Code, 2: New Pass
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Google Ref
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // --- GOOGLE OAUTH INITIALIZATION ---
  useEffect(() => {
    // Helper to parse JWT
    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return {};
        }
    };

    const handleGoogleCredentialResponse = (response: any) => {
        try {
            const data = parseJwt(response.credential);
            if (data.email) {
                // Real Login Success
                const fullName = data.name || "Google User";
                // Use provided picture or fallback
                onLogin(UserRole.USER, fullName, data.picture, data.email);
            } else {
                setError("Failed to retrieve user information from Google.");
            }
        } catch (err) {
            setError("Google Sign-In failed. Please try again.");
        }
    };

    // Initialize Google Button if script is loaded
    if (window.google && googleBtnRef.current) {
        try {
            window.google.accounts.id.initialize({
                client_id: "360174265748-nqb0dk8qi8bk0hil4ggt12d53ecvdobo.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
            
            // Render the real Google button
            window.google.accounts.id.renderButton(
                googleBtnRef.current,
                { 
                    theme: "outline", 
                    size: "large", 
                    type: "icon", 
                    shape: "square",
                    logo_alignment: "center"
                } 
            );
        } catch (e) {
            console.error("Google Auth Error:", e);
        }
    }
  }, [onLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isLogin && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    
    if (!isLogin && (!firstName || !lastName || !birthday)) {
        setError("Please fill in all fields.");
        return;
    }

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (isLogin) {
          // Login Flow - Direct
          const existingUser = Database.getUserByEmail(email);
          
          if (existingUser) {
              const userName = existingUser.name;
              onLogin(UserRole.USER, userName, existingUser.avatar, email);
          } else {
              // Fallback for demo purposes if user doesn't exist in local DB yet
              // In production, this would be an error: "User not found"
              const namePart = email.split('@')[0];
              const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
              onLogin(UserRole.USER, formattedName, undefined, email);
          }
      } else {
          // Signup Flow - Go to Onboarding
          Database.simulateSendEmail(email, "Welcome to Peutic - Your Journey Begins");
          setLoading(false);
          setShowOnboarding(true);
      }
    }, 1500);
  };

  // --- PASSWORD RESET LOGIC ---

  const handleForgotPasswordStep1 = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccessMsg('');

      setTimeout(() => {
          const existingUser = Database.getUserByEmail(email);
          if (existingUser) {
            setResetStep(1);
            setSuccessMsg(`Verification code sent to ${email}`);
          } else {
            setError("No account found with this email address.");
          }
          setLoading(false);
      }, 1500);
  };

  const handleForgotPasswordStep2 = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      setTimeout(() => {
          if (resetCode.length === 6) {
              setResetStep(2);
              setSuccessMsg("Code verified. Please set a new password.");
          } else {
              setError("Invalid verification code. Try '123456'");
          }
          setLoading(false);
      }, 1000);
  };

  const handleForgotPasswordStep3 = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
      }
      if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
      }

      setLoading(true);
      
      setTimeout(() => {
          setIsResettingPassword(false);
          setIsLogin(true);
          setResetStep(0);
          setSuccessMsg("Password updated successfully. Please log in.");
          setLoading(false);
      }, 1500);
  };


  const finishOnboarding = () => {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const formattedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
      onLogin(UserRole.USER, formattedName, undefined, email, birthday);
  };

  const handleSimulatedOAuth = async (provider: string) => {
    // Only for X and Facebook where we don't have a backend/SDK loaded
    setLoading(true);
    setAuthProvider(provider);
    setError('');
    
    setTimeout(() => {
        if (provider === 'X') {
            const width = 600;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            const w = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left}`);
            if (w) {
                w.document.write(`
                    <html>
                        <body style="background-color:black; color:white; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100%;">
                            <h1>Connecting to X...</h1>
                        </body>
                    </html>
                `);
                setTimeout(() => {
                    w.close();
                    setLoading(false);
                    setAuthProvider(null);
                    onLogin(UserRole.USER, "Alex (X Verified)", undefined, "alex.x@example.com");
                }, 1500);
            } else {
                 setLoading(false);
                 setAuthProvider(null);
                 onLogin(UserRole.USER, "Alex (X Verified)", undefined, "alex.x@example.com");
            }
            return;
        }

        if (provider === 'Facebook') {
             setLoading(false);
             setAuthProvider(null);
             onLogin(UserRole.USER, "Alex (FB Verified)", undefined, "alex.fb@example.com");
        }

    }, 1500);
  };

  const toggleTopic = (topic: string) => {
      if (selectedTopics.includes(topic)) {
          setSelectedTopics(selectedTopics.filter(t => t !== topic));
      } else {
          if (selectedTopics.length < 5) {
            setSelectedTopics([...selectedTopics, topic]);
          }
      }
  };

  // --- RENDER ONBOARDING ---
  if (showOnboarding) {
      const topics = [
          "Anxiety & Panic", "Depression", "Work Stress", "Relationships", 
          "Grief & Loss", "Sleep Issues", "Self Esteem", "Trauma", 
          "LGBTQ+", "Life Coaching", "Parenting", "Addiction"
      ];

      return (
        <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex flex-col md:flex-row">
            <div className="hidden md:block w-1/2 bg-peutic-yellow relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                     <Heart className="w-64 h-64 text-black opacity-10 animate-pulse" />
                </div>
                <div className="absolute bottom-20 left-10 text-black max-w-md p-8">
                    <h2 className="text-4xl font-bold mb-4">We're glad you're here.</h2>
                    <p className="text-xl font-medium">Let's personalize your safe space.</p>
                </div>
            </div>
            
            <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center relative bg-[#FFFBEB] overflow-y-auto">
                <div className="max-w-md w-full mx-auto">
                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-12">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`h-2 rounded-full flex-1 transition-all duration-500 ${i <= onboardingStep ? 'bg-peutic-yellow' : 'bg-yellow-100'}`}></div>
                        ))}
                    </div>

                    {onboardingStep === 0 && (
                        <div className="animate-float" style={{ animation: 'none' }}>
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                                <User className="w-8 h-8 text-peutic-yellow" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Welcome to Peutic, {firstName}.</h2>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                You've just taken the hardest step: showing up. We are a private community dedicated to real, human connection without judgment.
                            </p>
                            <button onClick={() => setOnboardingStep(1)} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {onboardingStep === 1 && (
                        <div className="animate-float" style={{ animation: 'none' }}>
                            <h2 className="text-3xl font-bold mb-8">The Peutic Promise</h2>
                            <div className="space-y-6 mb-10">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">100% Private</h4>
                                        <p className="text-gray-500">Your sessions are encrypted and never recorded without consent.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Available 24/7</h4>
                                        <p className="text-gray-500">Insomnia? Panic attack? We are here instantly, anytime.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Heart className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Real Connection</h4>
                                        <p className="text-gray-500">Human specialists tailored to your specific needs.</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setOnboardingStep(2)} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                I Understand <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {onboardingStep === 2 && (
                        <div className="animate-float" style={{ animation: 'none' }}>
                            <h2 className="text-3xl font-bold mb-2">How can we help?</h2>
                            <p className="text-gray-500 mb-8">Select up to 5 topics so we can match you with the perfect specialists.</p>
                            
                            <div className="flex flex-wrap gap-3 mb-10">
                                {topics.map(topic => (
                                    <button 
                                        key={topic}
                                        onClick={() => toggleTopic(topic)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                            selectedTopics.includes(topic) 
                                            ? 'bg-black text-white border-black shadow-lg scale-105' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                            
                            <button onClick={() => setOnboardingStep(3)} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                Next Step <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {onboardingStep === 3 && (
                        <div className="text-center animate-float" style={{ animation: 'none' }}>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">You are all set!</h2>
                            <p className="text-gray-500 text-lg mb-8">
                                We have curated a list of specialists based on your preferences. Your first step towards a better you starts now.
                            </p>
                            <div className="bg-white p-4 rounded-xl mb-8 text-left border border-yellow-100 shadow-sm">
                                <p className="text-sm font-bold text-gray-800 mb-1">Quick Tip:</p>
                                <p className="text-sm text-gray-500">You can browse specialist bios and check their ratings before connecting. Sessions are charged by the minute, so you are always in control.</p>
                            </div>
                            <button onClick={finishOnboarding} className="w-full bg-peutic-yellow text-black py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg flex items-center justify-center gap-2">
                                Enter Dashboard <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
      );
  }

  // --- RENDER AUTH FORM ---
  return (
    <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex flex-col md:flex-row">
      {/* Left Side (Image) */}
      <div className="hidden md:block w-1/2 bg-black relative overflow-hidden">
        <img 
            src="https://picsum.photos/id/64/1000/1000?grayscale" 
            alt="Login Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-[20s]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-10 text-white max-w-md p-8">
            <div className="w-12 h-12 bg-peutic-yellow rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
                <Heart className="w-6 h-6 text-black fill-black" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome back to clarity.</h2>
            <p className="text-gray-300 text-lg">Your journey to a balanced mind continues here. Secure, private, and always supportive.</p>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center relative bg-[#FFFBEB] overflow-y-auto">
        <button onClick={onCancel} className="absolute top-8 right-8 text-sm text-gray-500 hover:text-black font-semibold">Back to Home</button>
        
        <div className="max-w-md w-full mx-auto pt-10 md:pt-0">
            
            {/* PASSWORD RESET VIEW */}
            {isResettingPassword ? (
                 <div className="animate-float" style={{ animation: 'none' }}>
                    <div className="mb-10">
                        <button 
                            onClick={() => { setIsResettingPassword(false); setResetStep(0); setError(''); setSuccessMsg(''); }} 
                            className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-black mb-4"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
                        </button>
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">Account Recovery</h2>
                        <p className="text-gray-500">
                            {resetStep === 0 && "Enter your email to receive a secure verification code."}
                            {resetStep === 1 && "Check your inbox. We sent a verification code."}
                            {resetStep === 2 && "Secure your account with a new password."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-pulse">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl flex items-center gap-2">
                            <Check className="w-4 h-4" /> {successMsg}
                        </div>
                    )}

                    {resetStep === 0 && (
                        <form onSubmit={handleForgotPasswordStep1} className="space-y-5">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="email" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                             </div>
                             <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
                             </button>
                        </form>
                    )}

                    {resetStep === 1 && (
                         <form onSubmit={handleForgotPasswordStep2} className="space-y-5">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all font-mono text-lg tracking-widest" 
                                        placeholder="123456"
                                        maxLength={6}
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                    />
                                </div>
                             </div>
                             <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                             </button>
                        </form>
                    )}

                    {resetStep === 2 && (
                         <form onSubmit={handleForgotPasswordStep3} className="space-y-5">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="password" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="password" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                             </div>
                             <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Update Password'}
                             </button>
                        </form>
                    )}
                 </div>
            ) : (
                /* LOGIN / SIGNUP VIEW */
                <div className="animate-float" style={{ animation: 'none' }}>
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">{isLogin ? 'Member Login' : 'Create Account'}</h2>
                        <p className="text-gray-500">
                            {isLogin ? 'Enter your credentials to access your private dashboard.' : 'Start your journey to wellness today.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-pulse">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* OAUTH BUTTONS */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* GOOGLE BUTTON - REAL */}
                        <div className="w-full h-14 flex items-center justify-center">
                            <div ref={googleBtnRef}></div>
                        </div>

                        {/* FACEBOOK BUTTON */}
                        <button 
                            type="button"
                            onClick={() => handleSimulatedOAuth('Facebook')}
                            className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors bg-white"
                        >
                            {loading && authProvider === 'Facebook' ? <RefreshCcw className="w-5 h-5 animate-spin text-blue-600" /> : (
                                <Facebook className="w-6 h-6 text-[#1877F2]" />
                            )}
                        </button>

                        {/* X (TWITTER) BUTTON */}
                        <button 
                            type="button"
                            onClick={() => handleSimulatedOAuth('X')}
                            className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors bg-white"
                        >
                            {loading && authProvider === 'X' ? <RefreshCcw className="w-5 h-5 animate-spin text-black" /> : (
                                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center mb-8">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Or continue with email</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        placeholder="Jane"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {!isLogin && (
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="date" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                    />
                                </div>
                             </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input 
                                    type="email" 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input 
                                    type="password" 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="password" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all" 
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                             </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between text-sm font-medium">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-gray-500 hover:text-black transition-colors"
                        >
                            {isLogin ? "New here? Create account" : "Already have an account? Sign in"}
                        </button>
                        {isLogin && (
                            <button onClick={() => setIsResettingPassword(true)} className="text-peutic-yellow hover:text-yellow-600 font-bold">
                                Forgot Password?
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
