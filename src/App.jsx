import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/class/LandingPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
