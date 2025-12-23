import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/class/LandingPage.jsx'
import Home from './pages/class/Home.jsx';
import ListDetail from './pages/class/ListDetail.jsx';
import { RequireAuth, RedirectIfAuth } from './components/AuthGuard.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectIfAuth><LandingPage /></RedirectIfAuth>} />

        <Route path="/myLists" element={<RequireAuth><Home route="myLists" /></RequireAuth>} />
        <Route path="/friendsLists" element={<RequireAuth><Home route="friendsLists" /></RequireAuth>} />
        <Route path="/findFriends" element={<RequireAuth><Home route="findFriends" /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Home route="profile" /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth><Home route="profile" /></RequireAuth>} />
        <Route path="/list/:listId" element={<RequireAuth><ListDetail /></RequireAuth>} />

        {/* Catch-all: redirect unknown routes to index */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
