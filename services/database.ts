
import { User, UserRole, Transaction, Companion, GlobalSettings, SystemLog, ServerMetric, MoodEntry, JournalEntry, PromoCode } from '../types';

// Simulation of a Backend using LocalStorage
// VERSIONED KEYS TO FORCE RESET (Updated to v7)
const DB_KEYS = {
  USER: 'peutic_db_current_user_v7',
  ALL_USERS: 'peutic_db_users_v7', 
  COMPANIONS: 'peutic_db_companions_v7',
  TRANSACTIONS: 'peutic_db_transactions_v7',
  SETTINGS: 'peutic_db_settings_v7',
  LOGS: 'peutic_db_logs_v7',
  MOODS: 'peutic_db_moods_v7',
  JOURNALS: 'peutic_db_journals_v7',
  PROMOS: 'peutic_db_promos_v7',
  QUEUE: 'peutic_db_queue_v7',
  ACTIVE_SESSIONS: 'peutic_db_active_sessions_v7',
  ADMIN_ATTEMPTS: 'peutic_db_admin_attempts_v7',
  BREATHE_COOLDOWN: 'peutic_db_breathe_cooldown_v7'
};

// Reliable Unsplash Images
export const INITIAL_COMPANIONS: Companion[] = [
  { id: 'c1', name: 'Ruby', specialty: 'Anxiety & Panic', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Specializing in grounding techniques.', replicaId: 're3a705cf66a' },
  { id: 'c2', name: 'Carter', specialty: 'Life Coaching', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Building a roadmap for success.', replicaId: 'rca8a38779a8' },
  { id: 'c3', name: 'James', specialty: 'Men\'s Health', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600&h=600', bio: 'A safe space for pressure and balance.', replicaId: 'r92debe21318' },
  { id: 'c4', name: 'Danny', specialty: 'Grief Support', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Walking beside you through loss.', replicaId: 'r62baeccd777' },
  { id: 'c5', name: 'Anna', specialty: 'Family Dynamics', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Navigating complex relationships.', replicaId: 'r6ae5b6efc9d' },
  { id: 'c6', name: 'Elena', specialty: 'Women\'s Health', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Holistic support for hormonal health.', replicaId: 'r86e2c395e725' }, 
  { id: 'c7', name: 'Olivia', specialty: 'Workplace Stress', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1598550874175-4d7112ee7f41?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Handling burnout professionally.', replicaId: 'rc2146c13e81' },
  { id: 'c8', name: 'Charlie', specialty: 'Listening Ear', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Here to listen to your mind.', replicaId: 'rf4703150052' },
  { id: 'c9', name: 'Luna', specialty: 'Creative Blocks', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Unlocking your potential.', replicaId: 're5c4a8dd5ea' },
  { id: 'c10', name: 'Julia', specialty: 'Relationships', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Expert advice on connection.', replicaId: 'rb43357fb2ee' },
  { id: 'c11', name: 'Gabby', specialty: 'Self-Esteem', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Building confidence together.', replicaId: 'rdf61be0d4e1' },
  { id: 'c12', name: 'Katya', specialty: 'Mindfulness', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Guided meditation practices.', replicaId: 'r5791c5ab229' },
  { id: 'c13', name: 'Ivy', specialty: 'Youth Mentoring', status: 'AVAILABLE', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Support for young adults.', replicaId: 'r991fc9af2be' },
  { id: 'c14', name: 'Zane', specialty: 'Addiction', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Supportive accountability.', replicaId: 'r24efb3b9bef' },
  { id: 'c15', name: 'Rose', specialty: 'Trauma', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Gentle processing approaches.', replicaId: 'r3f8decedbd2' },
  { id: 'c16', name: 'Owen', specialty: 'Career', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Pivoting to your next chapter.', replicaId: 'r9458111c64a' },
  { id: 'c17', name: 'Sarah', specialty: 'Divorce', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Navigating separation.', replicaId: 'rf6b1c8d5e9d' },
  { id: 'c18', name: 'Kai', specialty: 'LGBTQ+', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Supportive ally for identity.', replicaId: 'r31e11adf1d3' },
  { id: 'c19', name: 'Jake', specialty: 'Social Anxiety', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Building social skills.', replicaId: 'r5791c5ab229' },
  { id: 'c20', name: 'Liam', specialty: 'Anger', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Constructive frustration.', replicaId: 'r90a0339d496' },
  { id: 'c21', name: 'Beth', specialty: 'Postpartum', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Support for new mothers.', replicaId: 'rec4a4153a78' },
  { id: 'c22', name: 'Mary', specialty: 'Spiritual', status: 'AVAILABLE', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1588516903720-860f194dc830?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Deep spiritual connection.', replicaId: 'r6ca16dbe104' },
  { id: 'c23', name: 'Destiny', specialty: 'Goals', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1589571894960-20bbe2815d22?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Actionable planning.', replicaId: 'r38a383b0173' },
  { id: 'c24', name: 'Rose Jr', specialty: 'Academic', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=600&h=600', bio: 'School and exam pressure.', replicaId: 'r1af76e94d00' },
  { id: 'c25', name: 'Raj', specialty: 'Cultural', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Navigating new cultures.', replicaId: 'ra066ab28864' },
  { id: 'c26', name: 'Ben', specialty: 'Phobias', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1480429370139-89acccb096b9?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Overcoming fears.', replicaId: 'r1a4e22fa0d9' },
  { id: 'c27', name: 'Steph', specialty: 'Burnout', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600&h=600', bio: 'Restoring balance.', replicaId: 'r9c55f9312fb' }
];

export class Database {
  // --- USER MANAGEMENT ---
  static getAllUsers(): User[] {
    const usersStr = localStorage.getItem(DB_KEYS.ALL_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  static createUser(name: string, email: string, provider: 'email' | 'google' | 'facebook' | 'x', birthday?: string, role: UserRole = UserRole.USER): User {
    const users = this.getAllUsers();
    if (role === UserRole.ADMIN && provider !== 'email') role = UserRole.USER; 

    const newUser: User = {
      id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      provider,
      balance: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FACC15&color=000`,
      subscriptionStatus: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      birthday
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users));
    this.saveUserSession(newUser);
    this.sendEmail(email, 'Welcome to Peutic', 'Your account has been successfully created.');
    return newUser;
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(DB_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  static saveUserSession(user: User) {
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
  }

  static clearSession() {
    localStorage.removeItem(DB_KEYS.USER);
  }

  static updateUser(updatedUser: User) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users));
    }
    const currentUser = this.getUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      this.saveUserSession(updatedUser);
    }
  }

  static getUserByEmail(email: string): User | undefined {
      return this.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static hasAdmin(): boolean {
      return this.getAllUsers().some(u => u.role === UserRole.ADMIN);
  }

  // --- ADMIN SECURITY ---
  static checkAdminLockout(): number | null {
      const attemptsStr = localStorage.getItem(DB_KEYS.ADMIN_ATTEMPTS);
      if (!attemptsStr) return null;
      const data = JSON.parse(attemptsStr);
      if (data.count >= 5) {
          const now = Date.now();
          const diff = now - data.lastAttempt;
          if (diff < 24 * 60 * 60 * 1000) { 
              return Math.ceil((24 * 60 * 60 * 1000 - diff) / (60 * 1000)); 
          } else {
              localStorage.removeItem(DB_KEYS.ADMIN_ATTEMPTS);
              return null;
          }
      }
      return null;
  }

  static recordAdminFailure() {
      const attemptsStr = localStorage.getItem(DB_KEYS.ADMIN_ATTEMPTS);
      let data = attemptsStr ? JSON.parse(attemptsStr) : { count: 0, lastAttempt: Date.now() };
      data.count += 1;
      data.lastAttempt = Date.now();
      localStorage.setItem(DB_KEYS.ADMIN_ATTEMPTS, JSON.stringify(data));
  }

  static resetAdminFailure() {
      localStorage.removeItem(DB_KEYS.ADMIN_ATTEMPTS);
  }

  // --- EMAIL SIMULATION ---
  static sendEmail(to: string, subject: string, body: string) {
      this.logSystemEvent('INFO', 'Email Sent', `Sent "${subject}" to ${to}`);
  }

  // --- COMPANION MANAGEMENT ---
  static getCompanions(): Companion[] {
    const saved = localStorage.getItem(DB_KEYS.COMPANIONS);
    if (!saved) {
        localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(INITIAL_COMPANIONS));
        return INITIAL_COMPANIONS;
    }
    return JSON.parse(saved);
  }

  static updateCompanion(updated: Companion) {
      const list = this.getCompanions();
      const idx = list.findIndex(c => c.id === updated.id);
      if (idx !== -1) {
          list[idx] = updated;
          localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(list));
      }
  }

  // --- TRANSACTIONS ---
  static topUpWallet(minutes: number, cost: number, targetUserId?: string) {
    let user = null;
    if (targetUserId) {
        const allUsers = this.getAllUsers();
        user = allUsers.find(u => u.id === targetUserId) || null;
    } else {
        user = this.getUser();
    }

    if (user) {
      user.balance += minutes;
      this.updateUser(user);
      this.addTransaction({
        id: `tx_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        date: new Date().toISOString(),
        amount: minutes,
        cost: cost,
        description: 'Wallet Top-up',
        status: 'COMPLETED'
      });
      this.logSystemEvent('SUCCESS', 'Payment Received', `User ${user.email} added $${cost}`);
    }
  }

  static deductBalance(minutes: number) {
    const user = this.getUser();
    if (user) {
      user.balance = Math.max(0, user.balance - minutes);
      this.updateUser(user);
    }
  }

  static getAllTransactions(): Transaction[] {
    const txStr = localStorage.getItem(DB_KEYS.TRANSACTIONS);
    return txStr ? JSON.parse(txStr) : [];
  }

  static getUserTransactions(userId: string): Transaction[] {
    return this.getAllTransactions().filter(tx => tx.userId === userId).reverse();
  }

  static addTransaction(tx: Transaction) {
    const all = this.getAllTransactions();
    if (!tx.userId) {
        const u = this.getUser();
        if (u) { tx.userId = u.id; tx.userName = u.name; }
    }
    all.push(tx);
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(all));
  }

  // --- SETTINGS ---
  static getSettings(): GlobalSettings {
    const saved = localStorage.getItem(DB_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      pricePerMinute: 1.49,
      maintenanceMode: false,
      allowSignups: true,
      siteName: 'Peutic',
      maxConcurrentSessions: 15,
      multilingualMode: true
    };
  }

  static saveSettings(s: GlobalSettings) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(s));
    this.logSystemEvent('WARNING', 'Settings Changed', 'Global configuration updated by admin');
  }

  // --- LOGS & METRICS ---
  static getSystemLogs(): SystemLog[] {
      const saved = localStorage.getItem(DB_KEYS.LOGS);
      return saved ? JSON.parse(saved) : [];
  }

  static logSystemEvent(type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SECURITY', event: string, details: string) {
      const logs = this.getSystemLogs();
      const newLog: SystemLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: new Date().toISOString(),
          type,
          event,
          details
      };
      logs.unshift(newLog); 
      if (logs.length > 200) logs.pop(); 
      localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  }

  static getServerMetrics(): ServerMetric[] {
      const now = new Date();
      const active = this.getActiveSessionCount();
      return Array.from({length: 10}, (_, i) => ({
          time: new Date(now.getTime() - i * 5000).toLocaleTimeString(),
          cpu: 20 + Math.random() * 30 + (active * 2),
          memory: 30 + Math.random() * 20,
          latency: 15 + Math.random() * 40,
          activeSessions: active
      })).reverse();
  }

  // --- QUEUE ---
  static joinQueue(userId: string): number {
      const q = JSON.parse(localStorage.getItem(DB_KEYS.QUEUE) || '[]');
      if (!q.includes(userId)) {
          q.push(userId);
          localStorage.setItem(DB_KEYS.QUEUE, JSON.stringify(q));
      }
      return q.indexOf(userId) + 1;
  }

  static leaveQueue(userId: string) {
      let q = JSON.parse(localStorage.getItem(DB_KEYS.QUEUE) || '[]');
      q = q.filter((id: string) => id !== userId);
      localStorage.setItem(DB_KEYS.QUEUE, JSON.stringify(q));
  }

  static getQueuePosition(userId: string): number {
      const q = JSON.parse(localStorage.getItem(DB_KEYS.QUEUE) || '[]');
      return q.indexOf(userId) + 1; 
  }

  static advanceQueue() {
      const q = JSON.parse(localStorage.getItem(DB_KEYS.QUEUE) || '[]');
      if (q.length > 0) {
          q.shift();
          localStorage.setItem(DB_KEYS.QUEUE, JSON.stringify(q));
      }
  }

  static getActiveSessionCount(): number {
      return parseInt(localStorage.getItem(DB_KEYS.ACTIVE_SESSIONS) || '0', 10);
  }

  static incrementActiveSessions() {
      let count = this.getActiveSessionCount();
      localStorage.setItem(DB_KEYS.ACTIVE_SESSIONS, (count + 1).toString());
  }

  static decrementActiveSessions() {
      let count = this.getActiveSessionCount();
      localStorage.setItem(DB_KEYS.ACTIVE_SESSIONS, Math.max(0, count - 1).toString());
      this.advanceQueue();
  }

  // --- WELLNESS ---
  static saveMood(entry: MoodEntry) {
      const moods = JSON.parse(localStorage.getItem(DB_KEYS.MOODS) || '[]');
      moods.push(entry);
      localStorage.setItem(DB_KEYS.MOODS, JSON.stringify(moods));
  }

  static saveJournal(entry: JournalEntry) {
      const journals = JSON.parse(localStorage.getItem(DB_KEYS.JOURNALS) || '[]');
      journals.push(entry);
      localStorage.setItem(DB_KEYS.JOURNALS, JSON.stringify(journals));
  }

  static getBreathingCooldown(): number | null {
      const cd = localStorage.getItem(DB_KEYS.BREATHE_COOLDOWN);
      return cd ? parseInt(cd, 10) : null;
  }

  static setBreathingCooldown(timestamp: number) {
      localStorage.setItem(DB_KEYS.BREATHE_COOLDOWN, timestamp.toString());
  }

  // --- PROMOS ---
  static getPromoCodes(): PromoCode[] {
      return JSON.parse(localStorage.getItem(DB_KEYS.PROMOS) || '[]');
  }
  
  static createPromoCode(code: string, discount: number) {
      const list = this.getPromoCodes();
      list.push({ id: Date.now().toString(), code: code.toUpperCase(), discountPercentage: discount, uses: 0, active: true });
      localStorage.setItem(DB_KEYS.PROMOS, JSON.stringify(list));
  }

  static deletePromoCode(id: string) {
      const list = this.getPromoCodes().filter(p => p.id !== id);
      localStorage.setItem(DB_KEYS.PROMOS, JSON.stringify(list));
  }
}
