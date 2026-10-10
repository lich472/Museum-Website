
import "./App.css";
// Styles for the features carried over from the Jason_P5 branch.
import "./styles/p5-features.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Exhibitions from "./pages/Exhibitions";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Visit from "./pages/Visit";
import Footer from "./components/Footer";

// Carried over from the Jason_P5 branch.
import EventsList from "./components/EventsList";
import EventDetail from "./components/EventDetail";
import EventRegister from "./components/EventRegister";
import Accessibility from "./components/Accessibility";
import Facilities from "./components/Facilities";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/visit" element={<Visit />} />

        {/* Jason_P5 features */}
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/register" element={<EventRegister />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/facilities" element={<Facilities />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;