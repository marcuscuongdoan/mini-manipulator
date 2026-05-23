import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import MobileBasePage from './pages/MobileBase'
import ManipulatorPage from './pages/Manipulator'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<MobileBasePage />} />
        <Route path="/manipulator" element={<ManipulatorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
