
import React, { useState } from 'react';
import { Database } from '../services/database';
import { UserRole } from '../types';
import { Lock, AlertCircle, Shield, ArrowRight, Key, PlusCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (user: any) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Registration State
  const [showRegister, setShowRegister] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // BRUTE FORCE CHECK
  const lockout = Database.checkAdminLockout();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (lockout) {
        setError(`System Locked. Try again in ${lockout} minutes.`);
        return;
    }

    setLoading(true);
    setTimeout(() => {
        const user = Database.getUserByEmail(email);
        // Verify User Exists + Role = Admin
        if (user && user.role === UserRole.ADMIN) {
            Database.resetAdminFailure();
            Database.logSystemEvent('SECURITY', 'Admin Login', `Admin ${user.email} logged into Command Center`);
            onLogin(user);
        } else {
             Database.recordAdminFailure();
             Database.logSystemEvent('SECURITY', 'Failed Admin Login', `Invalid attempt: ${email}`);
             setError("Access Denied. Incident reported.");
        }
        setLoading(false);
    }, 1000);
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (masterKey !== 'PEUTIC-MASTER-2025') {
          setError("Invalid Master Key. This incident has been logged.");
          return;
      }
      // Create User and Force Admin Role
      const u = Database.createUser('System Admin', newAdminEmail, 'email', undefined, UserRole.ADMIN);
      Database.logSystemEvent('SUCCESS', 'Admin Initialized', `Admin root account created: ${newAdminEmail}`);
      setShowRegister(false);
      alert("Admin Account Created. Please Login.");
  };

  const hasAdmin = Database.hasAdmin();

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

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                {lockout ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-red-500">TERMINAL LOCKED</h3>
                        <p className="text-gray-500 mt-2">Too many failed attempts.</p>
                        <p className="text-white font-mono mt-4">Unlock in: {lockout}m</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl flex items-center gap-2 font-bold">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        {showRegister ? (
                             <form onSubmit={handleRegisterAdmin} className="space-y-6 animate-in fade-in">
                                <h3 className="text-white font-bold text-center">Initialize Root Admin</h3>
                                <input 
                                    type="password" 
                                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-500 outline-none"
                                    placeholder="Master Key"
                                    value={masterKey}
                                    onChange={e => setMasterKey(e.target.value)}
                                />
                                <input 
                                    type="email" 
                                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-500 outline-none"
                                    placeholder="New Admin Email"
                                    value={newAdminEmail}
                                    onChange={e => setNewAdminEmail(e.target.value)}
                                />
                                <button className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl">INITIALIZE SYSTEM</button>
                                <button type="button" onClick={() => setShowRegister(false)} className="text-gray-500 text-sm w-full text-center hover:text-white">Cancel</button>
                             </form>
                        ) : (
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

                                {!hasAdmin && (
                                    <button type="button" onClick={() => setShowRegister(true)} className="w-full border border-gray-800 text-gray-500 py-3 rounded-xl text-xs font-bold hover:bg-gray-900 hover:text-white transition-colors flex items-center justify-center gap-2">
                                        <PlusCircle className="w-3 h-3" /> INITIALIZE SYSTEM (First Run)
                                    </button>
                                )}
                            </form>
                        )}
                    </>
                )}
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
