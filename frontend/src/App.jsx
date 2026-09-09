import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ExhibitionList from './components/ExhibitionList';
import ExhibitionDetail from './components/ExhibitionDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header style={{ padding: '20px', backgroundColor: '#2c3e50', color: 'white' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h1 style={{ margin: 0 }}>🏛️ Regional Museum</h1>
          </Link>
          <nav style={{ marginTop: '8px' }}>
            <Link to="/" style={{ color: '#ecf0f1', marginRight: '16px', textDecoration: 'none' }}>
              Exhibitions
            </Link>
          </nav>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ExhibitionList />} />
            <Route path="/exhibitions" element={<ExhibitionList />} />
            <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;