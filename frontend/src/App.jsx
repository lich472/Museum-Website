
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Exhibitions from "./pages/Exhibitions";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Visit from "./pages/Visit";
import Footer from "./components/Footer";
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { useUserStore } from "./stores/useUserStore.js";
import { useEffect } from "react";


function App() {

  const{user,checkAuth,checkingAuth} = useUserStore();

  useEffect(() => {
    checkAuth();
  },[checkAuth])

  if(checkingAuth) return <LoadingSpinner />

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={"/"} />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/visit" element={<Visit />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;