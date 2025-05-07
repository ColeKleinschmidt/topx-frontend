import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/class/LandingPage.jsx'
import Home from './pages/class/Home.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<LandingPage />} />
        <Route path="/feed" element={<Home />} />
        <Route path="/friends" element={<Home />} />
        <Route path="/profile" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
