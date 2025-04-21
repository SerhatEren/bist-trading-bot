import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './styles/theme.css'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import Footer from './components/Footer'
import { TradingPage } from './components/trading'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/trading" element={<TradingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
