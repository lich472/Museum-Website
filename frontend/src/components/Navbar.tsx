import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <nav className="nav-container">

        <div className="museum-logo">
          <Link to="/">
            <h2>Regional Museum</h2>
            <p>History • Culture • Discovery</p>
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/exhibitions">
            Exhibitions
          </Link>

          <Link to="/collections">
            Collections
          </Link>

          <Link to="/visit">
            Plan Your Visit
          </Link>

          {/* Carried over from the Jason_P5 branch */}
          <Link to="/events">
            Events
          </Link>

          <Link to="/accessibility">
            Accessibility
          </Link>

          <Link to="/facilities">
            Facilities
          </Link>
        </div>

      </nav>
    </header>
  );
}

export default Navbar;