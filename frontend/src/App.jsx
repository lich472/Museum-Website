
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
      {/* The first focusable element on every page: lets keyboard and
          screen-reader users skip the navigation and land on the content
          (WCAG 2.4.1). Every page renders inside the wrapper below, so this one
          target covers all of them. */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar />

      <div id="main-content" tabIndex={-1}>
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
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;