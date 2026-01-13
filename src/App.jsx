import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MegaSenaPredictor from './components/MegaSenaPredictor';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MegaSenaPredictor />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
