import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { PortScanner } from './pages/PortScanner';
import { Wappalyzer } from './pages/Wappalyzer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-900">
                    Target Recon
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/port-scanner" element={<PortScanner />} />
            <Route path="/wappalyzer" element={<Wappalyzer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
