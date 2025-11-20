
import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { Heart, Lock, Mail, ArrowRight, Check, Facebook, AlertCircle, Key, RefreshCcw, ChevronRight } from 'lucide-react';
import { Database } from '../services/database';

interface AuthProps {
  onLogin: (role: UserRole, name: string, avatar?: string, email?: string) => void;
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
  const [name, setName] = useState('');
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

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (isLogin) {
          // Login Flow - Direct
          const userName = name || (email.split('@')[0]);
          const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
          onLogin(UserRole.USER, formattedName, undefined, email);
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
            // Security: Don't reveal user doesn't exist, but for demo we might just warn
            setError("No account found with this email address.");
          }
          setLoading(false);
      }, 1500);
  };

  const handleForgotPasswordStep2 = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      // Simulate code check
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
      const userName = name || (email.split('@')[0]);
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      // Default to USER role, DB will upgrade if first user
      onLogin(UserRole.USER, formattedName, undefined, email);
  };

  const handleSimulatedOAuth = async (provider: string) => {
    setLoading(true);
    setAuthProvider(provider);
    setError('');
    
    // Fallback for Launch: Instruct user to use email if OAuth fails/is restricted
    // This prevents "Demo Mode" confusion on iPhone
    const delay = 1000;

    setTimeout(() => {
        setLoading(false);
        setAuthProvider(null);
        setError("For security on this device, please sign up with Email & Password.");
    }, delay);
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
            
            <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center relative bg-[#FFFBEB]">
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
                                <Sparkles className="w-8 h-8 text-peutic-yellow" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Welcome to Peutic.</h2>
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
                                        <Clock className="w-6 h-6 text-yellow-600" />
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
                                        required 
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Send Verification Code'}
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
                                        required 
                                        maxLength={6}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white tracking-widest font-mono"
                                        placeholder="123456"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-right">Did not receive it? <span className="text-black font-bold cursor-pointer hover:underline" onClick={() => setResetStep(0)}>Resend</span></p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Verify Code'}
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
                                        required 
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white"
                                        placeholder="New secure password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="password" 
                                        required 
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><RefreshCcw className="w-4 h-4" /> Reset Password</>}
                            </button>
                        </form>
                    )}
                 </div>

            ) : (
                /* NORMAL LOGIN / SIGNUP VIEW */
                <>
                    <div className="text-center md:text-left mb-10">
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">{isLogin ? 'Member Login' : 'Create Account'}</h2>
                        <p className="text-gray-500">
                            {isLogin ? 'Enter your credentials to access your secure dashboard.' : 'Join thousands finding peace with Peutic.'}
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
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
                                    required 
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white"
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
                                    required 
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-peutic-yellow focus:ring-1 focus:ring-peutic-yellow outline-none transition-all bg-white focus:bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {isLogin && (
                                <div className="flex justify-end mt-2">
                                    <button 
                                        type="button"
                                        onClick={() => { setIsResettingPassword(true); setError(''); setSuccessMsg(''); }}
                                        className="text-xs font-bold text-gray-500 hover:text-black"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <div className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${password && confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-gray-400'}`}>
                                    {password && confirmPassword && password === confirmPassword ? <Check className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <input 
                                    type="password" 
                                    required 
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all bg-white focus:bg-white ${password && confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-peutic-yellow focus:ring-peutic-yellow'}`}
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
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-peutic-yellow hover:text-black transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mt-4"
                        >
                            {loading && !authProvider ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="my-8 flex items-center gap-4">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <span className="text-gray-400 text-sm">Or continue with</span>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 h-[46px]">
                        {/* Google Button (Custom High Fidelity) - Strictly sized */}
                        <button 
                            type="button"
                            onClick={() => handleSimulatedOAuth('google')}
                            disabled={loading}
                            className="w-full h-full flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors group disabled:opacity-50 overflow-hidden"
                        >
                            {loading && authProvider === 'google' ? (
                                <span className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></span>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.01-.19.01-.38.01-.58z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            )}
                        </button>

                        {/* Facebook Button */}
                        <button 
                            type="button"
                            onClick={() => handleSimulatedOAuth('facebook')} 
                            disabled={loading}
                            className="w-full h-full flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors group disabled:opacity-50 overflow-hidden"
                        >
                            {loading && authProvider === 'facebook' ? (
                                <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></span>
                            ) : (
                                <Facebook className="w-5 h-5 text-blue-600" />
                            )}
                        </button>

                        {/* X Button - Routes to Popup */}
                        <button 
                            type="button"
                            onClick={() => handleSimulatedOAuth('x')} 
                            disabled={loading}
                            className="w-full h-full flex items-center justify-center border border-gray-200 rounded-xl bg-black hover:bg-gray-900 hover:border-black transition-colors group disabled:opacity-50 overflow-hidden"
                        >
                            {loading && authProvider === 'x' ? (
                                <span className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            {isLogin ? "Don't have an account? " : "Already a member? "}
                            <button 
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                                className="text-black font-bold hover:underline"
                            >
                                {isLogin ? 'Sign up free' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

function Sparkles(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5h4"/><path d="M19 21v-4"/><path d="M15 19h4"/></svg>
    )
}

function Shield(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    )
}

function Clock(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )
}

function ChevronRight(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6-6"/></svg>
    )
}
