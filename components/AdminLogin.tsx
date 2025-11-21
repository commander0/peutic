
import React, { useState } from 'react';
import { Database } from '../services/database';
import { UserRole } from '../types';
import { Lock, AlertCircle, Shield, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (user: any) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
        const user = Database.getUserByEmail(email);
        // In a real app, check password hash. 
        // Here we check if user exists AND is an Admin.
        if (user && user.role === UserRole.ADMIN) {
            Database.logSystemEvent('SECURITY', 'Admin Login', `Admin ${user.email} logged into Command Center`);
            onLogin(user);
        } else if (user && user.role !== UserRole.ADMIN) {
             setError("Access Denied: Insufficient Privileges.");
             Database.logSystemEvent('SECURITY', 'Failed Admin Login', `User ${email} attempted admin access`);
        } else {
             setError("Invalid Credentials.");
        }
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                    <Shield className="w-8 h-8 text-black fill-black" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">COMMAND CENTER</h1>
                <p className="text-gray-500 font-mono text-xs mt-2 tracking-widest uppercase">Restricted Access Level 5</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl flex items-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Admin Identifier</label>
                        <input 
                            type="email" 
                            className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-colors"
                            placeholder="admin@peutic.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Secure Key</label>
                        <input 
                            type="password" 
                            className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    >
                        {loading ? <span className="animate-pulse">Authenticating...</span> : <><Lock className="w-4 h-4" /> ACCESS TERMINAL</>}
                    </button>
                </form>
            </div>
            
            <div className="mt-8 text-center">
                <a href="/" className="text-gray-600 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                    Return to Public Site <ArrowRight className="w-3 h-3" />
                </a>
            </div>
        </div>
    </div>
  );
};

export default AdminLogin;
