import { Link } from "react-router";
import "./NavbarActions.css";

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
        </div>

        <div className="nav-visitor-actions" role="group" aria-label="Tickets and membership">
          <Link className="nav-buy-tickets" to="/booking">Buy Tickets</Link>
          <Link className="nav-membership" to="/membership">Membership</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
