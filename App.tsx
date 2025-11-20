
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { User, UserRole, Companion } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import VideoRoom from './components/VideoRoom';
import { Database } from './services/database';
import { AlertTriangle, Wrench } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeSessionCompanion, setActiveSessionCompanion] = useState<Companion | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Security: Activity Tracking
  const lastActivityRef = useRef<number>(Date.now());

  // Restore session on load and check settings
  useEffect(() => {
    const savedUser = Database.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    
    const settings = Database.getSettings();
    setMaintenanceMode(settings.maintenanceMode);

    // Poll settings for realtime admin lockout
    const interval = setInterval(() => {
        const currentSettings = Database.getSettings();
        setMaintenanceMode(currentSettings.maintenanceMode);
    }, 2000);

    setIsRestoring(false);
    return () => clearInterval(interval);
  }, []);

  // --- SESSION TIMEOUT LOGIC ---
  useEffect(() => {
    // Function to update last activity timestamp
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity));
    };
  }, []);

  useEffect(() => {
    // Check for timeout every minute
    const checkTimeout = () => {
      if (!user) return;
      
      // Don't timeout if user is currently in a video session
      if (activeSessionCompanion) {
          lastActivityRef.current = Date.now(); // Keep session alive during call
          return;
      }

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      
      // Policy: 15 Minutes for Users (Privacy), 24 Hours for Admins (Utility)
      const timeoutLimit = user.role === UserRole.ADMIN 
        ? 24 * 60 * 60 * 1000 
        : 15 * 60 * 1000;

      if (elapsed > timeoutLimit) {
        handleLogout();
        alert("For your security, your session has expired due to inactivity. Please log in again.");
      }
    };

    const interval = setInterval(checkTimeout, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, activeSessionCompanion]);


  const handleLogin = (role: UserRole, name: string, avatar?: string, email?: string) => {
    let currentUser = Database.getUser();
    
    // If simulated/oauth name is different, assume update/new
    const userEmail = email || `${name.toLowerCase().replace(/ /g, '.')}@example.com`;
    
    if (!currentUser || currentUser.email !== userEmail) {
        // Search existing users by email first
        const allUsers = Database.getAllUsers();
        const existing = allUsers.find(u => u.email === userEmail);
        
        if (existing) {
            currentUser = existing;
            // Update avatar if OAuth provided a new one
            if (avatar) {
                currentUser.avatar = avatar;
                Database.updateUser(currentUser);
            }
        } else {
            // New Account Creation Logic
            // "Turn Key" Feature: If no admins exist in the database, the first user becomes Admin.
            // CRITICAL CHANGE: OAuth users (who didn't provide email/pass) should NOT become admin automatically.
            // Admin status should be reserved for the manual email sign-up to avoid accidental privileges during demo.
            
            const adminExists = Database.hasAdmin();
            // Only grant admin if no admin exists AND it's an explicit email login (not oauth)
            const isOAuth = !!avatar && (name.includes('Verified') || role === UserRole.USER);
            
            const finalRole = (!adminExists && !isOAuth) ? UserRole.ADMIN : UserRole.USER;

            currentUser = Database.createUser(name, userEmail, finalRole);
            if (avatar) {
                currentUser.avatar = avatar;
                Database.updateUser(currentUser);
            }
        }
    }

    setUser(currentUser);
    Database.saveUserSession(currentUser);
    lastActivityRef.current = Date.now(); // Reset timer on login
    setShowAuth(false);
  };

  const handleLogout = () => {
    Database.clearSession();
    setUser(null);
    setActiveSessionCompanion(null);
  };

  if (isRestoring) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]"><div className="w-8 h-8 border-4 border-peutic-yellow border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Maintenance Screen (Bypass for Admins)
  if (maintenanceMode && (!user || user.role !== UserRole.ADMIN)) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Wrench className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4">System Maintenance</h1>
            <p className="text-gray-400 max-w-md text-lg">
                Peutic is currently undergoing scheduled upgrades to improve your experience. We will be back online shortly.
            </p>
            <div className="mt-8 text-xs text-gray-600 font-mono">
                Status Code: 503 • Service Unavailable
            </div>
            {/* Hidden Admin Bypass for demo: Click the status code */}
            <button onClick={() => setShowAuth(true)} className="mt-8 opacity-0 hover:opacity-100 transition-opacity text-xs text-gray-700">Admin Entry</button>
        </div>
      );
  }

  // Video Session Logic
  if (activeSessionCompanion && user) {
    return (
        <VideoRoom 
            companion={activeSessionCompanion} 
            onEndSession={() => setActiveSessionCompanion(null)} 
            userName={user.name}
        />
    );
  }

  // Authenticated Views
  if (user) {
    if (user.role === UserRole.ADMIN) {
      return <AdminDashboard onLogout={handleLogout} />;
    }
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout} 
        onStartSession={(c) => setActiveSessionCompanion(c)} 
      />
    );
  }

  // Auth View
  if (showAuth) {
    return <Auth onLogin={handleLogin} onCancel={() => setShowAuth(false)} />;
  }

  // Public View
  return (
    <Router>
      <LandingPage onLoginClick={() => setShowAuth(true)} />
    </Router>
  );
};

export default App;
