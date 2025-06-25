import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { HomePage } from './components/HomePage'
import { WirelessCommPage } from './components/WirelessCommPage'
import { OFDMPage } from './components/OFDMPage'
import { LinkBudgetPage } from './components/LinkBudgetPage'
import { CellularPage } from './components/CellularPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wireless-comm" element={<WirelessCommPage />} />
            <Route path="/ofdm" element={<OFDMPage />} />
            <Route path="/link-budget" element={<LinkBudgetPage />} />
            <Route path="/cellular" element={<CellularPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

