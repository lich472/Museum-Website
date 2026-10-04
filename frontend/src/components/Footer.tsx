import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h2>Regional Museum</h2>
          <p>
            Connecting people with history, culture and stories
            through meaningful museum experiences.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>

          <Link to="/">Home</Link>
          <Link to="/exhibitions">Exhibitions</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/visit">Plan Your Visit</Link>
        </div>

        <div className="footer-info">
          <h3>Visit</h3>
          <p>Open daily</p>
          <p>10:00 AM – 5:00 PM</p>
          <p>Free general admission</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 Regional Museum. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;