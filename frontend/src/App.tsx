import { BrowserRouter, Routes, Route, Link } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import BookingsPage from './features/bookings/BookingsPage'
import MembershipsPage from './features/memberships/MembershipsPage'
import './App.css'

function IndexPage() {
  return (
    <div className="home-intro">
      <span className="eyebrow">HISTORY · CULTURE · COMMUNITY</span>
      <h1>
        A little discovery.
        <br />A day to remember.
      </h1>
      <p>
        Explore stories, discover exhibitions, and make time for something new.
      </p>
      <Link className="text-link" to="/visit">
        Plan your visit →
      </Link>
      <section className="highlights">
        <span className="highlight-mark" aria-hidden="true">
          ✳
        </span>
        <h2>Highlights</h2>
        <p>Exhibitions, activities and stories will appear here.</p>
      </section>
    </div>
  )
}
function Placeholder({ title }: { title: string }) {
  return (
    <section className="placeholder-page">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <div className="site-shell">
        <Header />
        <main
          id="main-content"
          className="site-container main-content"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/booking" element={<BookingsPage />} />
            <Route path="/tickets" element={<BookingsPage />} />
            <Route path="/membership" element={<MembershipsPage />} />
            {Object.entries({
              visit: 'Plan your visit',
              accessibility: 'Accessibility',
              login: 'Log in',
              contact: 'Contact us',
              shop: 'Museum shop',
              privacy: 'Privacy & Legal',
            }).map(([path, title]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={<Placeholder title={title} />}
              />
            ))}
            <Route path="*" element={<Placeholder title="Page not found" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
