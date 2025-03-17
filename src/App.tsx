import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './styles/theme.css'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Strategies from './components/Strategies'
import StrategyDetail from './components/StrategyDetail'
import StrategyCreator from './components/StrategyCreator'
import Settings from './components/Settings'
import StatisticsPage from './pages/StatisticsPage'
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
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/strategies/new" element={<StrategyCreator />} />
            <Route path="/strategies/:id/edit" element={<StrategyCreator />} />
            <Route path="/strategies/:id" element={<StrategyDetail />} />
            <Route path="/statistics" element={<StatisticsPage />} />
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
