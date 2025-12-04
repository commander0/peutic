import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { AlertCircle, Send, Heart, Mail, Check } from 'lucide-react';
import { AuthService } from '../services/auth';

interface AuthProps {
  onLogin: (role: UserRole, name: string, avatar?: string, email?: string, birthday?: string, provider?: 'email' | 'google' | 'facebook' | 'x') => void;
  onCancel: () => void;
  initialMode?: 'login' | 'signup';
}

declare global {
    interface Window {
        google?: any;
        FB?: any;
        fbAsyncInit?: any;
    }
}

const Auth: React.FC<AuthProps> = ({ onLogin, onCancel, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  // Form Fields
  const [email, setEmail] = useState('');
  // Note: Password field removed because we are using Magic Links (Supabase default for security)
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false); // Magic Link Sent state

  // Google Auth Handler
  const handleGoogleLogin = async () => {
    try {
        setLoading(true);
        setError('');
        await AuthService.signInWithGoogle();
        // Note: The actual redirect happens via Supabase, so this function might not "finish" in the traditional sense before page reload
    } catch (e: any) {
        setError(e.message || "Google Sign-In failed.");
        setLoading(false);
    }
  };

  // Email Magic Link Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        await AuthService.signInWithEmail(email);
        setSent(true);
    } catch (e: any) {
        setError(e.message || "Failed to send magic link.");
    } finally {
        setLoading(false);
    }
  };

  // Listen for auth state changes (e.g. after redirect from Google)
  useEffect(() => {
      const { data: authListener } = AuthService.onAuthStateChange((user) => {
          if (user) {
              // Map Supabase user to App user format
              const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Buddy';
              const avatar = user.user_metadata?.avatar_url;
              onLogin(
                  UserRole.USER, 
                  name, 
                  avatar, 
                  user.email, 
                  undefined, 
                  user.app_metadata?.provider as any || 'email'
              );
          }
      });

      return () => {
          authListener.subscription.unsubscribe();
      };
  }, [onLogin]);


  // --- MAGIC LINK SENT SCREEN ---
  if (sent) {
      return (
        <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-yellow-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Check your email</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    We sent a secure magic link to <br/>
                    <span className="font-bold text-black">{email}</span>.
                    <br/>Click it to sign in instantly.
                </p>
                <button onClick={() => setSent(false)} className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
                    Try a different email
                </button>
            </div>
        </div>
      );
  }

  // --- MAIN AUTH SCREEN ---
  return (
    <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex flex-col md:flex-row">
      
      {/* Left Side (Desktop Only) - Visuals */}
      <div className="hidden md:block w-1/2 bg-black relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-10 text-white max-w-md p-8">
            <h2 className="text-4xl font-bold mb-4">Your sanctuary awaits.</h2>
            <p className="text-gray-300 text-lg">Secure, private, and always here for you.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-start md:justify-center relative bg-[#FFFBEB] overflow-y-auto">
        <button onClick={onCancel} className="absolute top-8 right-8 text-sm text-gray-500 hover:text-black font-bold z-10 transition-colors">Back</button>
        
        {/* Added pt-24 for mobile top spacing to avoid notch issues */}
        <div className="max-w-md w-full mx-auto pt-24 md:pt-0">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-black mb-2 text-gray-900">Welcome to Peutic</h2>
                <p className="text-gray-500">Sign in to continue your journey.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 font-bold animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Google Button */}
            <button 
                type="button" 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-white bg-white shadow-sm transition-all hover:scale-[1.02] mb-8 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sign in with Google"
            >
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                 <span className="font-bold text-gray-700">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <span className="relative bg-[#FFFBEB] px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Or use email</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <input 
                        type="email" 
                        required 
                        className="w-full p-4 rounded-xl border border-yellow-200 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400" 
                        placeholder="name@example.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        disabled={loading}
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading || !email} 
                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</span>
                    ) : (
                        'Send Magic Link'
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">We'll send a secure login link. No password needed.</p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
