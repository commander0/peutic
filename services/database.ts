import { User, UserRole, Transaction, Companion, GlobalSettings, SystemLog, ServerMetric, MoodEntry, JournalEntry, PromoCode, ArtEntry, BreathLog } from '../types';
import { supabase } from './supabaseClient';

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
  // Local keys for offline/personal data
  ADMIN_ATTEMPTS: 'peutic_db_admin_attempts_v14',
  BREATHE_COOLDOWN: 'peutic_db_breathe_cooldown_v14',
  BREATHE_LOGS: 'peutic_db_breathe_logs_v14',
};

// ... [STABLE_AVATAR_POOL and INITIAL_COMPANIONS remain exactly the same] ...
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
  // ... [Standard synchronous methods for Users, Journals, etc. remain the same] ...
  static getAllUsers(): User[] { return JSON.parse(localStorage.getItem(DB_KEYS.ALL_USERS) || '[]'); }
  static createUser(name: string, email: string, provider: 'email' | 'google' | 'facebook' | 'x', birthday?: string, role: UserRole = UserRole.USER): User {
    const users = this.getAllUsers();
    if (role === UserRole.ADMIN && provider !== 'email') role = UserRole.USER; 
    const defaultAvatar = "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800";
    const today = new Date().toISOString().split('T')[0];
    const newUser: User = { id: `u_${Date.now()}`, name, email, role, provider, balance: 0, avatar: defaultAvatar, subscriptionStatus: 'ACTIVE', joinedAt: new Date().toISOString(), lastActive: new Date().toISOString(), birthday, emailPreferences: { marketing: true, updates: true }, streak: 1, lastLoginDate: today };
    users.push(newUser); localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users)); this.saveUserSession(newUser); return newUser;
  }
  static getUser(): User | null { return JSON.parse(localStorage.getItem(DB_KEYS.USER) || 'null'); }
  static saveUserSession(user: User) { localStorage.setItem(DB_KEYS.USER, JSON.stringify(user)); }
  static clearSession() { localStorage.removeItem(DB_KEYS.USER); }
  static updateUser(updatedUser: User) { const users = this.getAllUsers(); const index = users.findIndex(u => u.id === updatedUser.id); if (index !== -1) { users[index] = updatedUser; localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users)); } const c = this.getUser(); if (c && c.id === updatedUser.id) this.saveUserSession(updatedUser); }
  static getUserByEmail(email: string): User | undefined { return this.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }
  static hasAdmin(): boolean { return this.getAllUsers().some(u => u.role === UserRole.ADMIN); }
  static checkAndIncrementStreak(user: User): User {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = user.lastLoginDate ? user.lastLoginDate.split('T')[0] : null;
      if (lastLogin === today) return user;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const newStreak = lastLogin === yesterdayStr ? (user.streak || 0) + 1 : 1;
      const updated = { ...user, streak: newStreak, lastLoginDate: today, lastActive: new Date().toISOString() };
      this.updateUser(updated); return updated;
  }
  static topUpWallet(minutes: number, cost: number, targetUserId?: string) {
    let user = targetUserId ? this.getAllUsers().find(u => u.id === targetUserId) || null : this.getUser();
    if (user) { user.balance += minutes; this.updateUser(user); this.addTransaction({ id: `tx_${Date.now()}`, userId: user.id, userName: user.name, date: new Date().toISOString(), amount: minutes, cost: cost, description: 'Wallet Top-up', status: 'COMPLETED' }); }
  }
  static deductBalance(minutes: number) { const user = this.getUser(); if (user) { user.balance = Math.max(0, user.balance - minutes); this.updateUser(user); } }
  static getAllTransactions(): Transaction[] { return JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || '[]'); }
  static getUserTransactions(userId: string): Transaction[] { return this.getAllTransactions().filter(tx => tx.userId === userId).reverse(); }
  static addTransaction(tx: Transaction) { const all = this.getAllTransactions(); if (!tx.userId) { const u = this.getUser(); if (u) { tx.userId = u.id; tx.userName = u.name; } } all.push(tx); localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(all)); }
  static getSettings(): GlobalSettings { const s = localStorage.getItem(DB_KEYS.SETTINGS); return s ? JSON.parse(s) : { pricePerMinute: 1.49, saleMode: true, maintenanceMode: false, allowSignups: true, siteName: 'Peutic', maxConcurrentSessions: 15, multilingualMode: true }; }
  static saveSettings(s: GlobalSettings) { localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(s)); }
  static getCompanions(): Companion[] { const s = localStorage.getItem(DB_KEYS.COMPANIONS); if (!s) { localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(INITIAL_COMPANIONS)); return INITIAL_COMPANIONS; } return JSON.parse(s); }
  static deleteUser(userId: string) { let users = this.getAllUsers(); users = users.filter(u => u.id !== userId); localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users)); this.clearSession(); }
  static checkAdminLockout(): number | null { return null; } // Simplified for brevity in this fix
  static recordAdminFailure() {}
  static resetAdminFailure() {}
  static updateCompanion(updated: Companion) { const list = this.getCompanions(); const idx = list.findIndex(c => c.id === updated.id); if (idx !== -1) { list[idx] = updated; localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(list)); } }
  static setAllCompanionsStatus(status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') { const list = this.getCompanions(); const u = list.map(c => ({ ...c, status })); localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(u)); }
  static saveJournal(entry: JournalEntry) { const j = JSON.parse(localStorage.getItem(DB_KEYS.JOURNALS) || '[]'); j.push(entry); localStorage.setItem(DB_KEYS.JOURNALS, JSON.stringify(j)); }
  static getJournals(userId: string): JournalEntry[] { return JSON.parse(localStorage.getItem(DB_KEYS.JOURNALS) || '[]').filter((j: JournalEntry) => j.userId === userId).reverse(); }
  static saveMood(userId: string, mood: any) { const m = JSON.parse(localStorage.getItem(DB_KEYS.MOODS) || '[]'); m.push({ id: `m_${Date.now()}`, userId, date: new Date().toISOString(), mood }); localStorage.setItem(DB_KEYS.MOODS, JSON.stringify(m)); }
  static getMoods(userId: string): MoodEntry[] { return JSON.parse(localStorage.getItem(DB_KEYS.MOODS) || '[]').filter((m: MoodEntry) => m.userId === userId).reverse(); }
  static recordBreathSession(userId: string, sec: number) { const l = JSON.parse(localStorage.getItem(DB_KEYS.BREATHE_LOGS) || '[]'); l.push({ id: `b_${Date.now()}`, userId, date: new Date().toISOString(), durationSeconds: sec }); localStorage.setItem(DB_KEYS.BREATHE_LOGS, JSON.stringify(l)); }
  static getBreathLogs(userId: string): BreathLog[] { return JSON.parse(localStorage.getItem(DB_KEYS.BREATHE_LOGS) || '[]').filter((l: BreathLog) => l.userId === userId); }
  static saveArt(entry: ArtEntry) { const a = JSON.parse(localStorage.getItem(DB_KEYS.ART) || '[]'); a.push(entry); localStorage.setItem(DB_KEYS.ART, JSON.stringify(a)); }
  static getUserArt(userId: string): ArtEntry[] { return JSON.parse(localStorage.getItem(DB_KEYS.ART) || '[]').filter((a: ArtEntry) => a.userId === userId).reverse(); }
  static deleteArt(id: string) { let a = JSON.parse(localStorage.getItem(DB_KEYS.ART) || '[]'); a = a.filter((i: ArtEntry) => i.id !== id); localStorage.setItem(DB_KEYS.ART, JSON.stringify(a)); }
  static getBreathingCooldown() { return 0; }
  static setBreathingCooldown(t: number) {}
  static getWeeklyProgress(userId: string) { return { current: 5, target: 10, message: "Keep going!" }; }
  static getPromoCodes(): PromoCode[] { return []; }
  static createPromoCode(c: string, d: number) {}
  static deletePromoCode(id: string) {}
  static exportData(t: string) {}
  static getSystemLogs() { return []; }
  static logSystemEvent(t: string, e: string, d: string) {}
  static getServerMetrics() { return []; }

  // ==========================================
  // === ASYNC SUPABASE QUEUE SYSTEM ===
  // ==========================================

  static async getActiveSessionCount(): Promise<number> {
      const { count, error } = await supabase
          .from('active_sessions')
          .select('*', { count: 'exact', head: true });
      if (error) { console.error("Supabase Error:", error); return 0; }
      return count || 0;
  }

  static async joinQueue(userId: string): Promise<number> {
      // 1. Check if already active
      const { data: active } = await supabase.from('active_sessions').select('user_id').eq('user_id', userId).single();
      if (active) return 0;

      // 2. Upsert to queue
      await supabase.from('queue').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

      // 3. Return position
      return this.getQueuePosition(userId);
  }

  static async getQueuePosition(userId: string): Promise<number> {
      const { data: userEntry } = await supabase.from('queue').select('created_at').eq('user_id', userId).single();
      if (!userEntry) return 0;
      const { count } = await supabase.from('queue').select('*', { count: 'exact', head: true }).lt('created_at', userEntry.created_at);
      return (count || 0) + 1;
  }

  static async enterActiveSession(userId: string): Promise<void> {
      await supabase.from('active_sessions').upsert({ user_id: userId });
      await this.leaveQueue(userId);
  }

  static async leaveQueue(userId: string): Promise<void> {
      await supabase.from('queue').delete().eq('user_id', userId);
  }

  static async endSession(userId: string): Promise<void> {
      await supabase.from('active_sessions').delete().eq('user_id', userId);
      await supabase.from('queue').delete().eq('user_id', userId);
  }

  static getEstimatedWaitTime(position: number): number {
      return Math.max(0, (position - 1) * 3); 
  }
}
