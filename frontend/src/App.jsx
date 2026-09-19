import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ExhibitionList from './components/ExhibitionList';
import ExhibitionDetail from './components/ExhibitionDetail';
import EventsList from './components/EventsList';
import EventDetail from './components/EventDetail';
import EventRegister from './components/EventRegister';
import Accessibility from './components/Accessibility';
import Facilities from './components/Facilities';
import './App.css';

const navStyle = {
  color: '#ecf0f1',
  marginRight: '16px',
  textDecoration: 'none',
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header style={{ padding: '20px', backgroundColor: '#2c3e50', color: 'white' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h1 style={{ margin: 0 }}>🏛️ Regional Museum</h1>
          </Link>
          <nav style={{ marginTop: '8px' }}>
            <Link to="/" style={navStyle}>Exhibitions</Link>
            <Link to="/events" style={navStyle}>Events</Link>
            <Link to="/accessibility" style={navStyle}>Accessibility</Link>
            <Link to="/facilities" style={navStyle}>Facilities</Link>
          </nav>
        </header>

        <main className="site-main">
          <Routes>
            <Route path="/" element={<ExhibitionList />} />
            <Route path="/exhibitions" element={<ExhibitionList />} />
            <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/register" element={<EventRegister />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/facilities" element={<Facilities />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;