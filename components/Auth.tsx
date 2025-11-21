
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Heart, Lock, Mail, ArrowRight, Check, Facebook, AlertCircle, Key, RefreshCcw, ChevronRight, Calendar, User, X as XIcon, Shield } from 'lucide-react';
import { Database } from '../services/database';

interface AuthProps {
  // Updated signature to accept provider
  onLogin: (role: UserRole, name: string, avatar?: string, email?: string, birthday?: string, provider?: 'email' | 'google' | 'facebook' | 'x') => void;
  onCancel: () => void;
}

declare global {
    interface Window {
        google?: any;
        FB?: any;
        fbAsyncInit?: any;
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
  const [resetStep, setResetStep] = useState(0);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // --- FACEBOOK SDK INIT ---
  useEffect(() => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '1143120088010234', 
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement; 
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
  }, []);

  // --- GOOGLE OAUTH INITIALIZATION ---
  useEffect(() => {
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
                const fullName = data.name || "Buddy";
                // PASS PROVIDER 'google'
                onLogin(UserRole.USER, fullName, data.picture, data.email, undefined, 'google');
            }
        } catch (err) {
            console.error("Google Parse Error");
        }
    };

    if (window.google) {
        try {
            window.google.accounts.id.initialize({
                client_id: "360174265748-nqb0dk8qi8bk0hil4ggt12d53ecvdobo.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false, // FIXED: Disable FedCM to prevent NotAllowedError
            });
        } catch (e) {
            console.error("Google Auth Init Error:", e);
        }
    }
  }, [onLogin]);

  const handleGoogleClick = () => {
      if (window.google) {
          window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                  // Fallback or log if prompt is skipped
                  console.log("Google prompt skipped or not displayed:", notification);
              }
          });
      }
  };

  // --- REAL FACEBOOK LOGIN ---
  const handleFacebookLogin = () => {
      if (!window.FB) {
          setError("Facebook SDK loading... please try again in a moment.");
          return;
      }
      setLoading(true);
      setAuthProvider('Facebook');

      window.FB.login(function(response: any) {
          if (response.authResponse) {
             window.FB.api('/me', { fields: 'name, email, picture' }, function(profile: any) {
                 setLoading(false);
                 setAuthProvider(null);
                 const name = profile.name || "Buddy";
                 const pic = profile.picture?.data?.url;
                 const fbEmail = profile.email || `${profile.id}@facebook.com`;
                 // PASS PROVIDER 'facebook'
                 onLogin(UserRole.USER, name, pic, fbEmail, undefined, 'facebook');
             });
          } else {
             setLoading(false);
             setAuthProvider(null);
             setError("User cancelled login or did not fully authorize.");
          }
      }, {scope: 'public_profile,email'});
  };

  // --- X (TWITTER) SIMULATED POPUP ---
  const handleRealXLogin = () => {
      setLoading(true);
      setAuthProvider('X');
      setTimeout(() => {
          setLoading(false);
          setAuthProvider(null);
          // PASS PROVIDER 'x'
          onLogin(UserRole.USER, "Buddy", undefined, "x-user@example.com", undefined, 'x');
      }, 1500);
  };

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
    
    setTimeout(() => {
      if (isLogin) {
          const existingUser = Database.getUserByEmail(email);
          if (existingUser) {
              // PASS PROVIDER 'email' (inferred)
              onLogin(existingUser.role, existingUser.name, existingUser.avatar, email, undefined, 'email');
          } else {
              setLoading(false);
              setError("Invalid email address or password.");
          }
      } else {
          const existingUser = Database.getUserByEmail(email);
          if (existingUser) {
              setLoading(false);
              setError("An account with this email already exists.");
              return;
          }
          setLoading(false);
          setShowOnboarding(true);
      }
    }, 1000);
  };

  const finishOnboarding = () => {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const formattedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
      // PASS PROVIDER 'email'
      onLogin(UserRole.USER, formattedName, undefined, email, birthday, 'email');
  };

  // --- RENDER ONBOARDING ---
  if (showOnboarding) {
      return (
        <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex flex-col md:flex-row">
            <div className="hidden md:block w-1/2 bg-[#FACC15] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                     <Heart className="w-64 h-64 text-black opacity-10 animate-pulse" />
                </div>
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center bg-[#FFFBEB]">
                <div className="max-w-md w-full mx-auto">
                    {onboardingStep === 0 && (
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Welcome, {firstName}.</h2>
                            <p className="text-gray-500 text-lg mb-8">Let's get you set up.</p>
                            <button onClick={() => setOnboardingStep(1)} className="w-full bg-black text-white py-4 rounded-xl font-bold">Continue</button>
                        </div>
                    )}
                    {onboardingStep === 1 && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Privacy First</h2>
                            <p className="mb-8">Your sessions are 100% encrypted.</p>
                            <button onClick={() => setOnboardingStep(2)} className="w-full bg-black text-white py-4 rounded-xl font-bold">I Understand</button>
                        </div>
                    )}
                    {onboardingStep === 2 && (
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Topics</h2>
                            <div className="flex flex-wrap gap-3 mb-10 mt-4">
                                {["Anxiety", "Stress", "Career", "Relationships", "Grief"].map(t => (
                                    <button key={t} onClick={() => { 
                                        if (selectedTopics.includes(t)) setSelectedTopics(selectedTopics.filter(topic => topic !== t));
                                        else if (selectedTopics.length < 5) setSelectedTopics([...selectedTopics, t]);
                                    }} className={`px-4 py-2 border rounded-full font-bold ${selectedTopics.includes(t) ? 'bg-black text-white' : 'bg-white'}`}>{t}</button>
                                ))}
                            </div>
                            <button onClick={() => setOnboardingStep(3)} className="w-full bg-black text-white py-4 rounded-xl font-bold">Next</button>
                        </div>
                    )}
                    {onboardingStep === 3 && (
                        <div className="text-center">
                             <h2 className="text-3xl font-bold mb-4">All Set!</h2>
                             <button onClick={finishOnboarding} className="w-full bg-[#FACC15] text-black py-4 rounded-xl font-bold">Enter Dashboard</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="hidden md:block w-1/2 bg-black relative overflow-hidden">
        <img src="https://picsum.photos/id/64/1000/1000?grayscale" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-10 text-white max-w-md p-8">
            <h2 className="text-4xl font-bold mb-4">Welcome back to clarity.</h2>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center relative bg-[#FFFBEB] overflow-y-auto">
        <button onClick={onCancel} className="absolute top-8 right-8 text-sm text-gray-500 hover:text-black font-bold">Back</button>
        
        <div className="max-w-md w-full mx-auto pt-10 md:pt-0">
            {isResettingPassword ? (
                 <div>
                    <h2 className="text-3xl font-bold mb-4">Account Recovery</h2>
                    {error && <div className="text-red-500 mb-4 font-bold">{error}</div>}
                    {successMsg && <div className="text-green-600 mb-4 font-bold">{successMsg}</div>}
                    
                    {resetStep === 0 && (
                        <form onSubmit={(e) => { e.preventDefault(); setResetStep(1); setSuccessMsg(`Code sent to ${email}`); }}>
                             <input type="email" className="w-full p-3 mb-4 border rounded-xl" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                             <button className="w-full bg-black text-white py-3 rounded-xl font-bold">Send Code</button>
                        </form>
                    )}
                    {resetStep === 1 && (
                        <form onSubmit={(e) => { e.preventDefault(); if(resetCode === '123456') setResetStep(2); else setError('Invalid Code'); }}>
                             <input type="text" className="w-full p-3 mb-4 border rounded-xl" placeholder="123456" value={resetCode} onChange={e => setResetCode(e.target.value)} />
                             <button className="w-full bg-black text-white py-3 rounded-xl font-bold">Verify</button>
                        </form>
                    )}
                    {resetStep === 2 && (
                        <form onSubmit={(e) => { e.preventDefault(); setIsResettingPassword(false); setSuccessMsg('Password reset. Please login.'); }}>
                             <input type="password" className="w-full p-3 mb-4 border rounded-xl" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                             <input type="password" className="w-full p-3 mb-4 border rounded-xl" placeholder="Confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                             <button className="w-full bg-black text-white py-3 rounded-xl font-bold">Update</button>
                        </form>
                    )}
                    <button onClick={() => setIsResettingPassword(false)} className="mt-4 text-sm">Cancel</button>
                 </div>
            ) : (
                <div>
                    <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Member Login' : 'Create Account'}</h2>
                    <p className="text-gray-500 mb-8">Access your private dashboard.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* OAUTH GRID */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <button type="button" onClick={handleGoogleClick} className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-white bg-white">
                             <svg width="24" height="24" viewBox="0 0 24 24"><path d="M23.52 12.29C23.52 11.43 23.45 10.61 23.31 9.82H12V14.46H18.46C18.18 15.92 17.32 17.16 16.03 18.02V20.99H19.91C22.18 18.9 23.52 15.83 23.52 12.29Z" fill="#4285F4"/><path d="M12 24C15.24 24 17.96 22.93 19.91 20.99L16.03 18.02C14.95 18.74 13.58 19.17 12 19.17C8.87 19.17 6.22 17.06 5.27 14.2H1.26V17.31C3.24 21.25 7.31 24 12 24Z" fill="#34A853"/><path d="M5.27 14.2C5.03 13.33 4.9 12.42 4.9 11.5C4.9 10.58 5.03 9.67 5.27 8.8V5.69H1.26C0.46 7.29 0 9.1 0 11.5C0 13.9 0.46 15.71 1.26 17.31L5.27 14.2Z" fill="#FBBC05"/><path d="M12 3.83C13.76 3.83 15.35 4.44 16.59 5.62L20 2.21C17.96 0.31 15.24 0 12 0C7.31 0 3.24 2.75 1.26 6.69L5.27 9.8C6.22 6.94 8.87 3.83 12 3.83Z" fill="#EA4335"/></svg>
                        </button>

                        <button type="button" onClick={handleFacebookLogin} className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-50 bg-white">
                             {loading && authProvider === 'Facebook' ? <RefreshCcw className="w-5 h-5 animate-spin text-blue-600" /> : <Facebook className="w-6 h-6 text-[#1877F2]" />}
                        </button>

                        <button type="button" onClick={handleRealXLogin} className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 bg-white">
                             <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" className="w-full p-3 rounded-xl border" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    <input type="text" className="w-full p-3 rounded-xl border" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                                </div>
                                <input type="date" className="w-full p-3 rounded-xl border" value={birthday} onChange={e => setBirthday(e.target.value)} />
                            </>
                        )}
                        <input type="email" className="w-full p-3 rounded-xl border" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                        <input type="password" className="w-full p-3 rounded-xl border" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                        {!isLogin && (
                            <input type="password" className="w-full p-3 rounded-xl border" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center gap-2">
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 flex justify-between text-sm font-bold">
                        <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Create account" : "Sign in"}</button>
                        {isLogin && <button onClick={() => setIsResettingPassword(true)} className="text-[#FACC15]">Forgot Password?</button>}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
