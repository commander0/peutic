
import { User, UserRole, Transaction, Companion, GlobalSettings, SystemLog, ServerMetric, MoodEntry, JournalEntry } from '../types';

// Simulation of a MongoDB/Postgres Backend using LocalStorage
const DB_KEYS = {
  USER: 'peutic_db_current_user',
  ALL_USERS: 'peutic_db_users', 
  COMPANIONS: 'peutic_db_companions',
  TRANSACTIONS: 'peutic_db_transactions',
  SETTINGS: 'peutic_db_settings',
  LOGS: 'peutic_db_logs',
  MOODS: 'peutic_db_moods',
  JOURNALS: 'peutic_db_journals'
};

// Initial Seed Data
const INITIAL_COMPANIONS: Companion[] = [
  { id: 'c1', name: 'Ruby', specialty: 'Anxiety & Panic', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Specializing in grounding techniques and immediate stress relief.', replicaId: 're3a705cf66a' },
  { id: 'c2', name: 'Carter', specialty: 'Life Coaching', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Helping you build a roadmap for personal success.', replicaId: 'rca8a38779a8' },
  { id: 'c3', name: 'James', specialty: 'Men\'s Health', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200', bio: 'A safe space to discuss pressure, expectations, and balance.', replicaId: 'r92debe21318' },
  { id: 'c4', name: 'Danny', specialty: 'Grief Support', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Walking beside you through times of loss.', replicaId: 'r62baeccd777' },
  { id: 'c5', name: 'Anna', specialty: 'Family Dynamics', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Navigating complex family relationships with care.', replicaId: 'r6ae5b6efc9d' },
  { id: 'c7', name: 'Olivia', specialty: 'Workplace Stress', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1598550874175-4d7112ee7f41?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Strategies to handle burnout and professional anxiety.', replicaId: 'rc2146c13e81' },
  { id: 'c8', name: 'Charlie', specialty: 'General Listening', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Here to listen to whatever is on your mind.', replicaId: 'rf4703150052' },
  { id: 'c9', name: 'Luna', specialty: 'Creative Blocks', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Unlocking your potential through open dialogue.', replicaId: 're5c4a8dd5ea' },
  { id: 'c10', name: 'Julia', specialty: 'Relationships', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Expert advice on dating, marriage, and connection.', replicaId: 'rb43357fb2ee' },
  { id: 'c11', name: 'Gabby', specialty: 'Self-Esteem', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Building confidence and self-worth together.', replicaId: 'rdf61be0d4e1' },
  { id: 'c12', name: 'Katya', specialty: 'Mindfulness', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Guided meditation and mindful living practices.', replicaId: 'r5791c5ab229' },
  { id: 'c13', name: 'Ivy', specialty: 'Youth Mentoring', status: 'AVAILABLE', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Guidance and support for young adults.', replicaId: 'r991fc9af2be' },
  { id: 'c14', name: 'Zane', specialty: 'Addiction Recovery', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Supportive accountability and understanding.', replicaId: 'r24efb3b9bef' },
  { id: 'c15', name: 'Rose', specialty: 'Trauma Informed', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Gentle approaches to processing past events.', replicaId: 'r3f8decedbd2' },
  { id: 'c16', name: 'Owen', specialty: 'Career Transition', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Helping you pivot to your next great chapter.', replicaId: 'r9458111c64a' },
  { id: 'c17', name: 'Samantha', specialty: 'Divorce Support', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Navigating the emotional complexities of separation.', replicaId: 'rf6b1c8d5e9d' },
  { id: 'c18', name: 'Kai', specialty: 'LGBTQ+ Issues', status: 'AVAILABLE', rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', bio: 'A supportive ally for identity and acceptance.', replicaId: 'r31e11adf1d3' },
  { id: 'c19', name: 'Jakey', specialty: 'Social Anxiety', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Building social skills in a low-pressure environment.', replicaId: 'r5791c5ab229' },
  { id: 'c20', name: 'Liam', specialty: 'Anger Management', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Constructive ways to process frustration.', replicaId: 'r90a0339d496' },
  { id: 'c21', name: 'Beth', specialty: 'Postpartum Support', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Support for new mothers and transitions.', replicaId: 'rec4a4153a78' },
  { id: 'c22', name: 'Mary', specialty: 'Spiritual Guidance', status: 'AVAILABLE', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1588516903720-860f194dc830?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Connecting with your deeper spiritual self.', replicaId: 'r6ca16dbe104' },
  { id: 'c23', name: 'Destiny', specialty: 'Goal Setting', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1589571894960-20bbe2815d22?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Turning your dreams into actionable plans.', replicaId: 'r38a383b0173' },
  { id: 'c24', name: 'Rose (Jr)', specialty: 'Academic Stress', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Handling the pressures of school and exams.', replicaId: 'r1af76e94d00' },
  { id: 'c25', name: 'Raj', specialty: 'Cultural Adjustment', status: 'AVAILABLE', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Navigating life in a new culture or environment.', replicaId: 'ra066ab28864' },
  { id: 'c26', name: 'Ben', specialty: 'Financial Stress', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Emotional support for financial planning.', replicaId: 'r1a4e22fa0d9' },
  { id: 'c27', name: 'Steph', specialty: 'Sleep Hygiene', status: 'AVAILABLE', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?auto=format&fit=crop&q=80&w=200&h=200', bio: 'Developing habits for a restful night.', replicaId: 'r9c55f9312fb' },
];

const INITIAL_SETTINGS: GlobalSettings = {
  pricePerMinute: 1.49,
  maintenanceMode: false,
  allowSignups: true,
  siteName: 'Peutic',
  broadcastMessage: 'Welcome to Peutic. Specialists are standing by.'
};

export const Database = {
  // --- Auth & User Session ---
  getUser: (): User | null => {
    const stored = localStorage.getItem(DB_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  saveUserSession: (user: User): User => {
    const userWithTime = { ...user, lastActive: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(userWithTime));
    Database.updateUser(userWithTime);
    return userWithTime;
  },

  clearSession: () => {
    localStorage.removeItem(DB_KEYS.USER);
  },

  // --- User Management ---
  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(DB_KEYS.ALL_USERS);
    return stored ? JSON.parse(stored) : [];
  },

  hasAdmin: (): boolean => {
    const users = Database.getAllUsers();
    return users.some(u => u.role === UserRole.ADMIN);
  },

  createUser: (name: string, email: string, role: UserRole): User => {
    const newUser: User = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      balance: 0.00,
      subscriptionStatus: 'ACTIVE',
      avatar: `https://ui-avatars.com/api/?name=${name}&background=FACC15&color=000`,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    const users = Database.getAllUsers();
    users.push(newUser);
    localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users));
    Database.saveUserSession(newUser);
    Database.logSystemEvent('INFO', 'User Registration', `New user registered: ${email}`);
    return newUser;
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = Database.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  updateUser: (updatedUser: User) => {
    const users = Database.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(DB_KEYS.ALL_USERS, JSON.stringify(users));
    }
    const currentUser = Database.getUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem(DB_KEYS.USER, JSON.stringify(updatedUser));
    }
  },

  setAllCompanionsStatus: (status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
     const list = Database.getCompanions();
     const updatedList = list.map(c => ({ ...c, status }));
     localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(updatedList));
     Database.logSystemEvent('WARNING', 'Bulk Status Update', `Admin set all companions to ${status}`);
  },

  // --- Companions ---
  getCompanions: (): Companion[] => {
    const stored = localStorage.getItem(DB_KEYS.COMPANIONS);
    if (!stored) {
      localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(INITIAL_COMPANIONS));
      return INITIAL_COMPANIONS;
    }
    return JSON.parse(stored);
  },

  updateCompanion: (updatedCompanion: Companion) => {
    const list = Database.getCompanions();
    const index = list.findIndex(c => c.id === updatedCompanion.id);
    if (index !== -1) {
      list[index] = updatedCompanion;
      localStorage.setItem(DB_KEYS.COMPANIONS, JSON.stringify(list));
    }
  },

  // --- Settings ---
  getSettings: (): GlobalSettings => {
    const stored = localStorage.getItem(DB_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(stored);
  },

  saveSettings: (settings: GlobalSettings) => {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    Database.logSystemEvent('INFO', 'Settings Update', 'Global configuration updated');
  },

  // --- Transactions ---
  getAllTransactions: (): Transaction[] => {
    const stored = localStorage.getItem(DB_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  },

  getUserTransactions: (userId: string): Transaction[] => {
    const all = Database.getAllTransactions();
    return all.filter(t => t.userId === userId);
  },

  addTransaction: (tx: Transaction) => {
    const transactions = Database.getAllTransactions();
    transactions.unshift(tx);
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    if (tx.cost && tx.cost > 0) {
        Database.logSystemEvent('SUCCESS', 'Payment Processed', `Received $${tx.cost} from ${tx.userName}`);
    }
  },

  // --- Wallet ---
  deductBalance: (minutes: number): boolean => {
    const user = Database.getUser();
    if (!user) return false;
    if (user.balance < minutes) return false;
    user.balance -= minutes;
    Database.updateUser(user);
    return true;
  },

  topUpWallet: (amountMinutes: number, costDollars: number) => {
    const user = Database.getUser();
    if (!user) return;
    user.balance += amountMinutes;
    Database.updateUser(user);
    Database.addTransaction({
      id: `tx_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString(),
      amount: amountMinutes,
      cost: costDollars,
      description: 'Wallet Top-up',
      status: 'COMPLETED'
    });
  },

  // --- Wellness Features ---
  saveMood: (mood: MoodEntry) => {
    const stored = localStorage.getItem(DB_KEYS.MOODS);
    const moods: MoodEntry[] = stored ? JSON.parse(stored) : [];
    moods.push(mood);
    localStorage.setItem(DB_KEYS.MOODS, JSON.stringify(moods));
    Database.logSystemEvent('INFO', 'Mood Logged', `User ${mood.userId} logged mood: ${mood.mood}`);
  },

  getUserMoods: (userId: string): MoodEntry[] => {
    const stored = localStorage.getItem(DB_KEYS.MOODS);
    const moods: MoodEntry[] = stored ? JSON.parse(stored) : [];
    return moods.filter(m => m.userId === userId).reverse();
  },

  saveJournal: (entry: JournalEntry) => {
    const stored = localStorage.getItem(DB_KEYS.JOURNALS);
    const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
    entries.push(entry);
    localStorage.setItem(DB_KEYS.JOURNALS, JSON.stringify(entries));
  },

  getUserJournals: (userId: string): JournalEntry[] => {
    const stored = localStorage.getItem(DB_KEYS.JOURNALS);
    const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
    return entries.filter(j => j.userId === userId).reverse();
  },

  // --- Email Simulation ---
  simulateSendEmail: (to: string, subject: string) => {
      Database.logSystemEvent('SUCCESS', 'Email Sent', `Sent '${subject}' to ${to}`);
      // In a real app, this would trigger a backend API call to SendGrid/AWS SES
  },

  // --- Logging & Metrics ---
  getSystemLogs: (): SystemLog[] => {
      const stored = localStorage.getItem(DB_KEYS.LOGS);
      return stored ? JSON.parse(stored) : [];
  },

  logSystemEvent: (type: SystemLog['type'], event: string, details: string) => {
      const logs = Database.getSystemLogs();
      const newLog: SystemLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: new Date().toISOString(),
          type,
          event,
          details,
          ip: '192.168.1.x'
      };
      logs.unshift(newLog);
      // Keep last 100 logs
      if (logs.length > 100) logs.pop();
      localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  },

  getServerMetrics: (): ServerMetric[] => {
      // Generate fake metrics history for charts
      const metrics: ServerMetric[] = [];
      const now = Date.now();
      for (let i = 20; i >= 0; i--) {
          metrics.push({
              time: new Date(now - i * 10000).toLocaleTimeString(),
              cpu: 20 + Math.random() * 30,
              memory: 40 + Math.random() * 20,
              latency: 15 + Math.random() * 20,
              activeSessions: Math.floor(Math.random() * 15) + 5
          });
      }
      return metrics;
  }
};
