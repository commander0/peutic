import { User, UserRole, Transaction, Companion, GlobalSettings, SystemLog, ServerMetric, MoodEntry, JournalEntry, PromoCode, SessionMemory, GiftCard, ArtEntry, BreathLog } from '../types';

const DB_KEYS = {
  USER: 'peutic_db_current_user_v14',
  ALL_USERS: 'peutic_db_users_v14', 
  COMPANIONS: 'peutic_db_companions_v14',
  TRANSACTIONS: 'peutic_db_transactions_v14',
  SETTINGS: 'peutic_db_settings_v14',
  LOGS: 'peutic_db_logs_v14',
  MOODS: 'peutic_db_moods_v14',
  JOURNALS: 'peutic_db_journals_v14',
  ART: 'peutic_db_art_v14',
  PROMOS: 'peutic_db_promos_v14',
  QUEUE: 'peutic_db_queue_v14',
  ACTIVE_SESSIONS: 'peutic_db_active_sessions_v14',
  ADMIN_ATTEMPTS: 'peutic_db_admin_attempts_v14',
  BREATHE_COOLDOWN: 'peutic_db_breathe_cooldown_v14',
  BREATHE_LOGS: 'peutic_db_breathe_logs_v14',
  MEMORIES: 'peutic_db_memories_v14',
  GIFTS: 'peutic_db_gifts_v14',
  EMAILS: 'peutic_db_emails_v14'
};

// Expanded Stable Pool of Real Humans (Unsplash) - High Quality, Professional
export const STABLE_AVATAR_POOL = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", // Female Professional
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", // Male Smile
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800", // Female Asian
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800", // Male Beard
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800", // Female Model
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800", // Male Suit
    "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&q=80&w=800", // Female Soft
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800", // Male Generic
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=800", // Female Glasses
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800", // Male Older
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800", // Female
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800", // Male Professional
    "https://images.unsplash.com/photo-1598550874175-4d7112ee7f41?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1530268729831-4b0b97f70be4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1521119989659-a83eee488058?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1546539782-6fc531453083?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1589571894960-20bbe2815d22?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=800"
];

// All 27 Provided Replica IDs
export const INITIAL_COMPANIONS: Companion[] = [
  { id: 'c1', name: 'Ruby', gender: 'Female', specialty: 'Anxiety & Panic', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[0], bio: 'Specializing in grounding techniques.', replicaId: 're3a705cf66a' },
  { id: 'c2', name: 'Carter', gender: 'Male', specialty: 'Life Coaching', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[1], bio: 'Success roadmap planning.', replicaId: 'rca8a38779a8' },
  { id: 'c3', name: 'James', gender: 'Male', specialty: 'Men\'s Health', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[3], bio: 'Safe space for men.', replicaId: 'r92debe21318' },
  { id: 'c4', name: 'Danny', gender: 'Male', specialty: 'Grief Support', status: 'AVAILABLE', rating: 5.0, imageUrl: STABLE_AVATAR_POOL[5], bio: 'Walking beside you in grief.', replicaId: 'r62baeccd777' },
  { id: 'c5', name: 'Anna', gender: 'Female', specialty: 'Family Dynamics', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[2], bio: 'Navigating complex relationships.', replicaId: 'r6ae5b6efc9d' },
  { id: 'c6', name: 'Gloria', gender: 'Female', specialty: 'Elder Care', status: 'AVAILABLE', rating: 5.0, imageUrl: STABLE_AVATAR_POOL[4], bio: 'Support for caregivers.', replicaId: 'r4317e64d25a' }, 
  { id: 'c7', name: 'Olivia', gender: 'Female', specialty: 'Workplace Stress', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[6], bio: 'Burnout prevention strategies.', replicaId: 'rc2146c13e81' },
  { id: 'c8', name: 'Charlie', gender: 'Male', specialty: 'Listening Ear', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[7], bio: 'Non-judgmental listening.', replicaId: 'rf4703150052' },
  { id: 'c9', name: 'Luna', gender: 'Female', specialty: 'Creative Blocks', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[8], bio: 'Unlocking your potential.', replicaId: 're5c4a8dd5ea' },
  { id: 'c10', name: 'Julia', gender: 'Female', specialty: 'Relationships', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[10], bio: 'Modern dating advice.', replicaId: 'rb43357fb2ee' },
  { id: 'c11', name: 'Gabby', gender: 'Female', specialty: 'Self-Esteem', status: 'AVAILABLE', rating: 5.0, imageUrl: STABLE_AVATAR_POOL[12], bio: 'Building core confidence.', replicaId: 'rdf61be0d4e1' },
  { id: 'c12', name: 'Katya', gender: 'Female', specialty: 'Mindfulness', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[14], bio: 'Guided meditation.', replicaId: 'r5791c5ab229' },
  { id: 'c13', name: 'Ivy', gender: 'Female', specialty: 'Youth Mentoring', status: 'AVAILABLE', rating: 4.7, imageUrl: STABLE_AVATAR_POOL[15], bio: 'Young adult guidance.', replicaId: 'r991fc9af2be' },
  { id: 'c14', name: 'Zane', gender: 'Male', specialty: 'Addiction', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[9], bio: 'Supportive accountability.', replicaId: 'r24efb3b9bef' },
  { id: 'c15', name: 'Rose', gender: 'Female', specialty: 'Trauma', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[0], bio: 'Gentle processing.', replicaId: 'r3f8decedbd2' },
  { id: 'c16', name: 'Owen', gender: 'Male', specialty: 'Career', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[11], bio: 'Career pivots and growth.', replicaId: 'r9458111c64a' },
  { id: 'c17', name: 'Samantha', gender: 'Female', specialty: 'Divorce', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[16], bio: 'Separation support.', replicaId: 'rf6b1c8d5e9d' },
  { id: 'c18', name: 'Kai', gender: 'Male', specialty: 'LGBTQ+', status: 'AVAILABLE', rating: 5.0, imageUrl: STABLE_AVATAR_POOL[17], bio: 'Identity and acceptance.', replicaId: 'r31e11adf1d3' },
  { id: 'c19', name: 'Jakey', gender: 'Male', specialty: 'Social Anxiety', status: 'AVAILABLE', rating: 4.7, imageUrl: STABLE_AVATAR_POOL[18], bio: 'Overcoming shyness.', replicaId: 'r5fb46c843a8' },
  { id: 'c20', name: 'Liam', gender: 'Male', specialty: 'Anger Management', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[19], bio: 'Emotional regulation.', replicaId: 'r90a0339d496' },
  { id: 'c21', name: 'Beth', gender: 'Female', specialty: 'Postpartum', status: 'AVAILABLE', rating: 5.0, imageUrl: STABLE_AVATAR_POOL[20], bio: 'New mother support.', replicaId: 'rec4a4153a78' },
  { id: 'c22', name: 'Mary', gender: 'Female', specialty: 'Nutrition', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[21], bio: 'Holistic health.', replicaId: 'r6ca16dbe104' },
  { id: 'c23', name: 'Destiny', gender: 'Female', specialty: 'Spirituality', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[22], bio: 'Finding purpose.', replicaId: 'r38a383b0173' },
  { id: 'c24', name: 'Rosalie', gender: 'Female', specialty: 'Sleep', status: 'AVAILABLE', rating: 4.8, imageUrl: STABLE_AVATAR_POOL[23], bio: 'Insomnia relief.', replicaId: 'r1af76e94d00' },
  { id: 'c25', name: 'Raj', gender: 'Male', specialty: 'Medical Stress', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[24], bio: 'Chronic illness coping.', replicaId: 'ra066ab28864' },
  { id: 'c26', name: 'Ben', gender: 'Male', specialty: 'Financial Stress', status: 'AVAILABLE', rating: 4.7, imageUrl: STABLE_AVATAR_POOL[25], bio: 'Money mindset.', replicaId: 'r1a4e22fa0d9' },
  { id: 'c27', name: 'Steph', gender: 'Female', specialty: 'Parenting', status: 'AVAILABLE', rating: 4.9, imageUrl: STABLE_AVATAR_POOL[26], bio: 'Raising teens.', replicaId: 'r9c55f9312fb' },
];

export class Database {
  static getAllUsers(): User[] {
    const usersStr = localStorage.getItem(DB_KEYS.ALL_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  static createUser(name: string, email: string, provider: 'email' | 'google' | 'facebook' | 'x', birthday?: string, role: UserRole = UserRole.USER): User {
    const users = this.getAllUsers();
    if (role === UserRole.ADMIN && provider !== 'email') role = UserRole.USER; 

    // DEFAULT AVATAR: Sunny Smiling Face (Yellow Theme)
    const defaultAvatar = "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800";

    const newUser: User = {
      id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      provider,
      balance: 0,
      avatar: defaultAvatar, 
      subscriptionStatus: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      birthday,
      emailPreferences: { marketing: true, updates: true }
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users));
    this.saveUserSession(newUser);
    return newUser;
  }

  static deleteUser(userId: string) {
    let users = this.getAllUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users));
    this.clearSession();
    this.logSystemEvent('WARNING', 'Account Deleted', `User ${userId} deleted account.`);
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

  static setAllCompanionsStatus(status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') {
      const list = this.getCompanions();
      const updatedList = list.map(c => ({ ...c, status }));
      localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(updatedList));
      this.logSystemEvent('INFO', 'Mass Status Update', `All specialists set to ${status}`);
  }

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

  static getSettings(): GlobalSettings {
    const saved = localStorage.getItem(DB_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      pricePerMinute: 1.49,
      saleMode: true,
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
  
  // --- QUEUE SYSTEM ---
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

  static getQueueLength(): number {
      const q = JSON.parse(localStorage.getItem(DB_KEYS.QUEUE) || '[]');
      return q.length;
  }

  static getEstimatedWaitTime(position: number): number {
      return Math.max(0, (position - 1) * 5); 
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
  }

  // --- JOURNAL ---
  static saveJournal(entry: JournalEntry) {
      const journals = JSON.parse(localStorage.getItem(DB_KEYS.JOURNALS) || '[]');
      journals.push(entry);
      localStorage.setItem(DB_KEYS.JOURNALS, JSON.stringify(journals));
  }
  
  static getJournals(userId: string): JournalEntry[] {
      const journals = JSON.parse(localStorage.getItem(DB_KEYS.JOURNALS) || '[]');
      return journals.filter((j: JournalEntry) => j.userId === userId).reverse();
  }

  // --- MOOD TRACKER ---
  static saveMood(userId: string, mood: 'confetti' | 'rain' | null) {
      if (!mood) return;
      const moods = JSON.parse(localStorage.getItem(DB_KEYS.MOODS) || '[]');
      moods.push({
          id: `mood_${Date.now()}`,
          userId,
          date: new Date().toISOString(),
          mood
      });
      localStorage.setItem(DB_KEYS.MOODS, JSON.stringify(moods));
  }

  static getMoods(userId: string): MoodEntry[] {
      const moods = JSON.parse(localStorage.getItem(DB_KEYS.MOODS) || '[]');
      return moods.filter((m: MoodEntry) => m.userId === userId).reverse();
  }

  // --- BREATHING LOGS ---
  static recordBreathSession(userId: string, durationSeconds: number) {
      const logs = JSON.parse(localStorage.getItem(DB_KEYS.BREATHE_LOGS) || '[]');
      logs.push({
          id: `breath_${Date.now()}`,
          userId,
          date: new Date().toISOString(),
          durationSeconds
      });
      localStorage.setItem(DB_KEYS.BREATHE_LOGS, JSON.stringify(logs));
  }

  static getBreathLogs(userId: string): BreathLog[] {
      const logs = JSON.parse(localStorage.getItem(DB_KEYS.BREATHE_LOGS) || '[]');
      return logs.filter((l: BreathLog) => l.userId === userId);
  }

  // --- ART GALLERY (QUOTA SAFE) ---
  static saveArt(entry: ArtEntry) {
      let art = JSON.parse(localStorage.getItem(DB_KEYS.ART) || '[]');
      
      // 1. Add new entry to the end (UNLIMITED UNTIL ERROR)
      art.push(entry);
      
      try {
          localStorage.setItem(DB_KEYS.ART, JSON.stringify(art));
      } catch (e: any) {
          // 3. Quota Exceeded Handling
          if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
              console.warn("LocalStorage quota exceeded. Pruning old art to save new entry.");
              
              // Fallback: Remove oldest items one by one until it fits
              let saved = false;
              while (art.length > 1 && !saved) {
                 art.shift(); // Remove oldest
                 try {
                    localStorage.setItem(DB_KEYS.ART, JSON.stringify(art));
                    saved = true;
                 } catch (retryErr) {
                    // Continue loop
                 }
              }

              if (!saved) {
                 // If we can't even save the single new image
                 throw new Error("Storage full. Unable to save artwork.");
              }
          } else {
              throw e;
          }
      }
  }

  static getUserArt(userId: string): ArtEntry[] {
      const art = JSON.parse(localStorage.getItem(DB_KEYS.ART) || '[]');
      return art.filter((a: ArtEntry) => a.userId === userId).reverse();
  }

  static deleteArt(artId: string) {
      let art = JSON.parse(localStorage.getItem(DB_KEYS.ART) || '[]');
      art = art.filter((a: ArtEntry) => a.id !== artId);
      localStorage.setItem(DB_KEYS.ART, JSON.stringify(art));
  }

  static getBreathingCooldown(): number | null {
      const cd = localStorage.getItem(DB_KEYS.BREATHE_COOLDOWN);
      return cd ? parseInt(cd, 10) : null;
  }

  static setBreathingCooldown(timestamp: number) {
      localStorage.setItem(DB_KEYS.BREATHE_COOLDOWN, timestamp.toString());
  }

  // --- WEEKLY PROGRESS CALCULATION ---
  static getWeeklyProgress(userId: string): { current: number; target: number; message: string } {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const transactions = this.getUserTransactions(userId).filter(t => new Date(t.date) > oneWeekAgo && t.amount < 0);
      const journals = this.getJournals(userId).filter(j => new Date(j.date) > oneWeekAgo);
      const art = this.getUserArt(userId).filter(a => new Date(a.createdAt) > oneWeekAgo);
      const moods = this.getMoods(userId).filter(m => new Date(m.date) > oneWeekAgo);
      const breath = this.getBreathLogs(userId).filter(b => new Date(b.date) > oneWeekAgo);

      // SCORING: Session=3, Journal=1, Art=1, Breath=1, Mood=0.5
      const score = 
          (transactions.length * 3) + 
          (journals.length * 1) + 
          (art.length * 1) + 
          (breath.length * 1) +
          (moods.length * 0.5);

      const target = 10; // Weekly Point Target
      let message = "Start your journey.";
      const pct = score / target;

      if (pct > 0 && pct < 0.3) message = "Great start!";
      else if (pct >= 0.3 && pct < 0.6) message = "Building momentum!";
      else if (pct >= 0.6 && pct < 1) message = "Almost there!";
      else if (pct >= 1) message = "Goal Crushed! 🌟";

      return { current: score, target, message };
  }

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

  static exportData(type: 'USERS' | 'LOGS') {
      const data = type === 'USERS' ? this.getAllUsers() : this.getSystemLogs();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peutic_${type.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  static sendEmail(to: string, subject: string, body: string) {
      console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      
      const emails = JSON.parse(localStorage.getItem(DB_KEYS.EMAILS) || '[]');
      emails.push({
          id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          to,
          subject,
          body,
          sentAt: new Date().toISOString()
      });
      localStorage.setItem(DB_KEYS.EMAILS, JSON.stringify(emails));
      this.logSystemEvent('INFO', 'Email Service', `Email sent to ${to}: ${subject}`);
  }
}