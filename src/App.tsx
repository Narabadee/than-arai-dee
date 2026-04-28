import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PageFrame } from './components/layout/PageFrame';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_FRIDGE } from './data/ingredients';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { FloatingChats } from './components/shared/FloatingChats';
import { fetchSaved, addSaved, removeSaved } from './api/saved';
import { fetchFridge, saveFridge } from './api/fridge';

import { Home } from './pages/Home';
import { Fridge } from './pages/Fridge';
import { Recommendations } from './pages/Recommendations';
import { Search } from './pages/Search';
import { Random } from './pages/Random';
import { Social } from './pages/Social';
import { Saved } from './pages/Saved';
import { Admin } from './pages/Admin';
import { RecipeDetail } from './pages/RecipeDetail';
import { Profile } from './pages/Profile';

// Only admins — non-admins go home
const AdminRoute: React.FC = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Admin /> : <Navigate to="/" replace />;
};

// Only users — admins go to their dashboard
const UserRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/admin" replace /> : element;
};

// Inner component so it can use useAuth()
const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const [lsFridge, setLsFridge] = useLocalStorage<string[]>('nm-fridge-v2', DEFAULT_FRIDGE);
  const [lsSaved, setLsSaved] = useLocalStorage<string[]>('nm-saved-v2', []);
  const [dbFridge, setDbFridge] = useState<string[] | null>(null);
  const [dbSaved, setDbSaved] = useState<string[] | null>(null);

  // When user logs in/out, load or clear DB data
  useEffect(() => {
    if (user) {
      fetchFridge().then(setDbFridge).catch(() => setDbFridge(null));
      fetchSaved().then(setDbSaved).catch(() => setDbSaved(null));
    } else {
      setDbFridge(null);
      setDbSaved(null);
    }
  }, [user?.id]);

  const fridge = user && dbFridge !== null ? dbFridge : lsFridge;
  const saved = user && dbSaved !== null ? dbSaved : lsSaved;

  const setFridge = (updater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof updater === 'function' ? updater(fridge) : updater;
    if (user) {
      setDbFridge(next);
      saveFridge(next).catch(console.error);
    } else {
      setLsFridge(next);
    }
  };

  const toggleSaved = (id: string) => {
    const isSaved = saved.includes(id);
    const next = isSaved ? saved.filter(x => x !== id) : [...saved, id];
    if (user) {
      setDbSaved(next);
      (isSaved ? removeSaved(id) : addSaved(id)).catch(console.error);
    } else {
      setLsSaved(next);
    }
  };

  return (
    <PageFrame>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar fridgeCount={fridge.length} />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Routes>
            <Route path="/"        element={<UserRoute element={<Home fridge={fridge} />} />} />
            <Route path="/fridge"  element={<UserRoute element={<Fridge fridge={fridge} setFridge={setFridge} />} />} />
            <Route path="/recs"    element={<UserRoute element={<Recommendations fridge={fridge} />} />} />
            <Route path="/search"  element={<UserRoute element={<Search fridge={fridge} />} />} />
            <Route path="/random"  element={<UserRoute element={<Random fridge={fridge} />} />} />
            <Route path="/social"  element={<UserRoute element={<Social />} />} />
            <Route path="/saved"   element={<UserRoute element={<Saved saved={saved} fridge={fridge} toggleSaved={toggleSaved} />} />} />
            <Route path="/recipe/:id" element={<RecipeDetail fridge={fridge} saved={saved} toggleSaved={toggleSaved} />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
        <FloatingChats />
      </div>
    </PageFrame>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
