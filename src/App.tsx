import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LevelUpModal } from './components/LevelUpModal';
import { AchievementToast } from './components/AchievementToast';

import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <LevelUpModal />
          <AchievementToast />
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}
