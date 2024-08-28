import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import App from './App.jsx'
import SpotifyCallback from './SpotifyCallback'
import './index.css'

const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/callback" element={<SpotifyCallback />} />
    </Routes>
  </Router>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)