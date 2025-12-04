import React, { useState } from 'react';
import { UserRole } from '../types';
import { AlertCircle, Send, Heart, Mail } from 'lucide-react';
import { AuthService } from '../services/auth';

interface AuthProps {
  onLogin: (user: any) => void; 
  onCancel: () => void;
  initialMode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleGoogleLogin = async () => {
    try {
        setLoading(true);
        await AuthService.signInWithGoogle();
    } catch (e: any) {
        setError(e.message);
        setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        await AuthService.signInWithEmail(email);
        setSent(true);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  if (sent) {
      return (
        <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-yellow-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                <p className="text-gray-500 mb-6">We sent a magic link to <strong>{email}</strong>.<br/>Click it to sign in instantly.</p>
                <button onClick={onCancel} className="text-sm font-bold text-gray-400 hover:text-black">Back to Home</button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-[#FFFBEB] z-50 flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="hidden md:block w-1/2 bg-black relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-10 text-white max-w-md p-8">
            <h2 className="text-4xl font-bold mb-4">Your sanctuary awaits.</h2>
            <p className="text-gray-300">Secure, private, and always here for you.</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center bg-[#FFFBEB] relative">
        <button onClick={onCancel} className="absolute top-8 right-8 text-sm text-gray-500 hover:text-black font-bold">Back</button>
        
        <div className="max-w-md w-full mx-auto">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Welcome to Peutic</h2>
                <p className="text-gray-500">Sign in to continue your journey.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            <button onClick={handleGoogleLogin} className="w-full h-14 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-white bg-white shadow-sm transition-transform hover:scale-105 mb-6">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                <span className="font-bold text-gray-700">Continue with Google</span>
            </button>

            <div className="relative mb-6 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <span className="relative bg-[#FFFBEB] px-4 text-xs font-bold text-gray-400 uppercase">Or continue with email</span>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <input 
                    type="email" 
                    required 
                    className="w-full p-4 rounded-xl border border-yellow-200 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all" 
                    placeholder="name@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                />
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center gap-2 shadow-xl">
                    {loading ? 'Sending Link...' : 'Send Magic Link'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
