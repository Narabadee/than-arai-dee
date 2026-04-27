import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../components/shared/Icon';
import { login, signup } from '../api/users';

export interface AuthUser {
  id: string;
  username: string;
  color: string;
  role: 'user' | 'admin';
  display_name?: string;
  bio?: string;
  specialty?: string;
  avatar?: string;
  location?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  requireAuth: (callback: () => void) => void;
  openAuthModal: (pendingAction?: () => void) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

const readUser = (): AuthUser | null => {
  try { return JSON.parse(localStorage.getItem('nm-auth-user') || 'null'); } catch { return null; }
};
const writeUser = (u: AuthUser | null) => localStorage.setItem('nm-auth-user', JSON.stringify(u));

// --- Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(readUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  const isAdmin = user?.role === 'admin';

  const openAuthModal = useCallback((pendingAction?: () => void) => {
    pendingRef.current = pendingAction ?? null;
    setTab('login');
    setUsername('');
    setPassword('');
    setConfirm('');
    setFieldError('');
    setModalOpen(true);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    pendingRef.current = null;
  };

  const requireAuth = useCallback((callback: () => void) => {
    if (user) {
      callback();
    } else {
      openAuthModal(callback);
    }
  }, [user, openAuthModal]);

  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    writeUser(null);
    localStorage.removeItem('nm-token');
    navigate('/');
  };

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      writeUser(next);
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');
    const u = username.trim();
    const p = password;

    if (tab === 'signup') {
      if (u.length < 3) { setFieldError('Username must be at least 3 characters.'); return; }
      if (p.length < 4) { setFieldError('Password must be at least 4 characters.'); return; }
      if (p !== confirm) { setFieldError('Passwords do not match.'); return; }
    }

    setSubmitting(true);
    try {
      const fn = tab === 'login' ? login : signup;
      const { token, user: loggedIn } = await fn(u, p);
      localStorage.setItem('nm-token', token);
      setUser(loggedIn);
      writeUser(loggedIn);
      setModalOpen(false);

      // REDIRECTS
      if (loggedIn.role === 'admin') {
        navigate('/admin');
      }

      const action = pendingRef.current;
      pendingRef.current = null;
      if (action) setTimeout(action, 50);
    } catch (err: any) {
      setFieldError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout, updateUser, requireAuth, openAuthModal }}>
      {children}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nm-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              className="bg-nm-card border border-nm-line rounded-[24px] p-8 w-full max-w-md shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-display font-black italic text-2xl text-nm-yellow leading-none mb-1">
                    ทานอะไรดี
                  </div>
                  <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">
                    {tab === 'login' ? 'Welcome back, cook.' : 'Create your account.'}
                  </div>
                </div>
                <button onClick={closeModal} className="text-nm-inkDim hover:text-nm-ink transition-colors mt-1">
                  <Icon.X size={18} />
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-1 p-1 bg-nm-bg border border-nm-line rounded-full mb-6">
                {(['login', 'signup'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTab(t); setFieldError(''); }}
                    className={`flex-1 py-2 rounded-full text-[12px] font-bold transition-all ${
                      t === tab ? 'bg-nm-yellow text-nm-bg shadow-md' : 'text-nm-inkDim hover:text-nm-ink'
                    }`}
                  >
                    {t === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1.5 block">
                    USERNAME
                  </label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="@yourname"
                    autoComplete="username"
                    required
                    className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1.5 block">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/60 transition-colors"
                  />
                </div>

                <AnimatePresence>
                  {tab === 'signup' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1.5 block">
                        CONFIRM PASSWORD
                      </label>
                      <input
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required={tab === 'signup'}
                        className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/60 transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {fieldError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-nm-red font-mono text-[12px] bg-nm-red/10 border border-nm-red/20 rounded-xl px-4 py-3"
                  >
                    {fieldError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-nm-yellow text-nm-bg font-black text-[15px] hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Please wait…' : tab === 'login' ? 'Log in →' : 'Create account →'}
                </button>
              </form>

              <p className="text-center font-mono text-[10px] text-nm-inkDim mt-5">
                {tab === 'login' ? "No account? " : 'Already have one? '}
                <button
                  type="button"
                  onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setFieldError(''); }}
                  className="text-nm-yellow hover:underline"
                >
                  {tab === 'login' ? 'Sign up free' : 'Log in'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};
