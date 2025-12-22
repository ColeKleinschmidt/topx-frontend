import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/class/LandingPage.jsx'
import Home from './pages/class/Home.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<LandingPage />} />
        <Route path="/myLists" element={<Home route="myLists" />} />
        <Route path="/friendsLists" element={<Home route="friendsLists" />} />
        <Route path="/findFriends" element={<Home route="findFriends" />} />
        <Route path="/profile" element={<Home route="profile" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
