
import { User, UserRole, Transaction, Companion, GlobalSettings, SystemLog, ServerMetric, MoodEntry, JournalEntry, PromoCode, SessionMemory, GiftCard } from '../types';

const DB_KEYS = {
  USER: 'peutic_db_current_user_v11',
  ALL_USERS: 'peutic_db_users_v11', 
  COMPANIONS: 'peutic_db_companions_v11',
  TRANSACTIONS: 'peutic_db_transactions_v11',
  SETTINGS: 'peutic_db_settings_v11',
  LOGS: 'peutic_db_logs_v11',
  MOODS: 'peutic_db_moods_v11',
  JOURNALS: 'peutic_db_journals_v11',
  PROMOS: 'peutic_db_promos_v11',
  QUEUE: 'peutic_db_queue_v11',
  ACTIVE_SESSIONS: 'peutic_db_active_sessions_v11',
  ADMIN_ATTEMPTS: 'peutic_db_admin_attempts_v11',
  BREATHE_COOLDOWN: 'peutic_db_breathe_cooldown_v11',
  MEMORIES: 'peutic_db_memories_v11',
  GIFTS: 'peutic_db_gifts_v11'
};

// Expanded Stable Pool
export const STABLE_AVATAR_POOL = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1598550874175-4d7112ee7f41?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800", 
    "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1521119989659-a83eee488058?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800"
];

export const INITIAL_COMPANIONS: Companion[] = [
  { id: 'c1', name: 'Ruby', gender: 'Female', specialty: 'Anxiety & Panic', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Specializing in grounding.', replicaId: 're3a705cf66a' },
  { id: 'c2', name: 'Carter', gender: 'Male', specialty: 'Life Coaching', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Success roadmap.', replicaId: 'rca8a38779a8' },
  { id: 'c3', name: 'James', gender: 'Male', specialty: 'Men\'s Health', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Safe space for men.', replicaId: 'r92debe21318' },
  { id: 'c4', name: 'Danny', gender: 'Male', specialty: 'Grief Support', status: 'AVAILABLE', rating: 5.0, imageUrl: '', bio: 'Walking beside you.', replicaId: 'r62baeccd777' },
  { id: 'c5', name: 'Anna', gender: 'Female', specialty: 'Family Dynamics', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Complex relationships.', replicaId: 'r6ae5b6efc9d' },
  { id: 'c6', name: 'Elena', gender: 'Female', specialty: 'Women\'s Health', status: 'AVAILABLE', rating: 5.0, imageUrl: '', bio: 'Hormonal health.', replicaId: 'r86e2c395e725' }, 
  { id: 'c7', name: 'Olivia', gender: 'Female', specialty: 'Workplace Stress', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Burnout strategy.', replicaId: 'rc2146c13e81' },
  { id: 'c8', name: 'Charlie', gender: 'Male', specialty: 'Listening Ear', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Just listening.', replicaId: 'rf4703150052' },
  { id: 'c9', name: 'Luna', gender: 'Female', specialty: 'Creative Blocks', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Unlock potential.', replicaId: 're5c4a8dd5ea' },
  { id: 'c10', name: 'Julia', gender: 'Female', specialty: 'Relationships', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Dating advice.', replicaId: 'rb43357fb2ee' },
  { id: 'c11', name: 'Gabby', gender: 'Female', specialty: 'Self-Esteem', status: 'AVAILABLE', rating: 5.0, imageUrl: '', bio: 'Building confidence.', replicaId: 'rdf61be0d4e1' },
  { id: 'c12', name: 'Katya', gender: 'Female', specialty: 'Mindfulness', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Guided meditation.', replicaId: 'r5791c5ab229' },
  { id: 'c13', name: 'Ivy', gender: 'Female', specialty: 'Youth Mentoring', status: 'AVAILABLE', rating: 4.7, imageUrl: '', bio: 'Young adult support.', replicaId: 'r991fc9af2be' },
  { id: 'c14', name: 'Zane', gender: 'Male', specialty: 'Addiction', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Supportive accountability.', replicaId: 'r24efb3b9bef' },
  { id: 'c15', name: 'Rose', gender: 'Female', specialty: 'Trauma', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Gentle processing.', replicaId: 'r3f8decedbd2' },
  { id: 'c16', name: 'Owen', gender: 'Male', specialty: 'Career', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Career pivots.', replicaId: 'r9458111c64a' },
  { id: 'c17', name: 'Sarah', gender: 'Female', specialty: 'Divorce', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Separation help.', replicaId: 'rf6b1c8d5e9d' },
  { id: 'c18', name: 'Kai', gender: 'Male', specialty: 'LGBTQ+', status: 'AVAILABLE', rating: 5.0, imageUrl: '', bio: 'Identity support.', replicaId: 'r31e11adf1d3' },
  { id: 'c19', name: 'Jake', gender: 'Male', specialty: 'Social Anxiety', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Social skills.', replicaId: 'r5791c5ab229' },
  { id: 'c20', name: 'Liam', gender: 'Male', specialty: 'Anger', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Constructive frustration.', replicaId: 'r90a0339d496' },
  { id: 'c21', name: 'Beth', gender: 'Female', specialty: 'Postpartum', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'New mother support.', replicaId: 'rec4a4153a78' },
  { id: 'c22', name: 'Mary', gender: 'Female', specialty: 'Spiritual', status: 'AVAILABLE', rating: 4.7, imageUrl: '', bio: 'Deep connection.', replicaId: 'r6ca16dbe104' },
  { id: 'c23', name: 'Destiny', gender: 'Female', specialty: 'Goals', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'Action plans.', replicaId: 'r38a383b0173' },
  { id: 'c24', name: 'Rose Jr', gender: 'Female', specialty: 'Academic', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Exam pressure.', replicaId: 'r1af76e94d00' },
  { id: 'c25', name: 'Raj', gender: 'Male', specialty: 'Cultural', status: 'AVAILABLE', rating: 4.9, imageUrl: '', bio: 'New cultures.', replicaId: 'ra066ab28864' },
  { id: 'c26', name: 'Ben', gender: 'Male', specialty: 'Phobias', status: 'AVAILABLE', rating: 4.8, imageUrl: '', bio: 'Overcoming fears.', replicaId: 'r1a4e22fa0d9' },
  { id: 'c27', name: 'Steph', gender: 'Female', specialty: 'Burnout', status: 'AVAILABLE', rating: 5.0, imageUrl: '', bio: 'Life balance.', replicaId: 'r9c55f9312fb' }
];

export class Database {
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
      avatar: '', 
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

  static sendEmail(to: string, subject: string, body: string) {
      this.logSystemEvent('INFO', 'Email Sent', `Sent "${subject}" to ${to}`);
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

  static saveSessionMemory(memory: SessionMemory) {
      const memories = JSON.parse(localStorage.getItem(DB_KEYS.MEMORIES) || '[]');
      memories.push(memory);
      localStorage.setItem(DB_KEYS.MEMORIES, JSON.stringify(memories));
      this.logSystemEvent('INFO', 'Memory Created', `Stored memory for ${memory.userId}`);
  }

  static getSessionMemories(userId: string): SessionMemory[] {
      const memories = JSON.parse(localStorage.getItem(DB_KEYS.MEMORIES) || '[]');
      return memories.filter((m: SessionMemory) => m.userId === userId).slice(-3);
  }

  static createGiftCard(amount: number, createdBy: string): string {
      const gifts = JSON.parse(localStorage.getItem(DB_KEYS.GIFTS) || '[]');
      const code = `PEUTIC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const newGift: GiftCard = { id: Date.now().toString(), code, amount, createdBy, isRedeemed: false };
      gifts.push(newGift);
      localStorage.setItem(DB_KEYS.GIFTS, JSON.stringify(gifts));
      return code;
  }

  static redeemGiftCard(code: string, userId: string): number | null {
      const gifts = JSON.parse(localStorage.getItem(DB_KEYS.GIFTS) || '[]');
      const giftIndex = gifts.findIndex((g: GiftCard) => g.code === code && !g.isRedeemed);
      if (giftIndex !== -1) {
          const gift = gifts[giftIndex];
          gifts[giftIndex].isRedeemed = true;
          localStorage.setItem(DB_KEYS.GIFTS, JSON.stringify(gifts));
          this.topUpWallet(gift.amount, 0, userId);
          return gift.amount;
      }
      return null;
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
}
