import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import LandingPage from './pages/class/LandingPage.jsx'
import Home from './pages/class/Home.jsx';
import ListDetail from './pages/class/ListDetail.jsx';
import { RequireAuth, RedirectIfAuth } from './components/AuthGuard.jsx'

function App() {
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsed, darkTheme: theme === 'dark' }));
      }
    } catch (error) {
      console.error('Failed to store theme preference', error);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectIfAuth><LandingPage /></RedirectIfAuth>} />
        <Route path="/myLists" element={<RequireAuth><Navigate to="/friendsLists" replace /></RequireAuth>} />
        <Route path="/discoverLists" element={<RequireAuth><Home route="discoverLists" /></RequireAuth>} />
        <Route path="/friendsLists" element={<RequireAuth><Home route="friendsLists" /></RequireAuth>} />
        <Route path="/findFriends" element={<RequireAuth><Home route="findFriends" /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Home route="profile" /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth><Home route="profile" /></RequireAuth>} />
        <Route path="/search" element={<RequireAuth><Home route="search" /></RequireAuth>} />
        <Route path="/list/:listId" element={<RequireAuth><ListDetail /></RequireAuth>} />

        {/* Catch-all: redirect unknown routes to index */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
