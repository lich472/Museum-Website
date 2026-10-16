import { Link } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";

/**
 * Shown by the catch-all route in App.jsx.
 *
 * Before it existed an unknown URL rendered the navbar and footer around an
 * empty page: HTTP 200, no heading, and only a React Router warning in the
 * console. The markup follows the other content pages (Visit, Exhibitions) so
 * it sits in the same wrapper and reads at the same size.
 */
function NotFound() {
  usePageTitle("Page not found");

  return (
    <main>
      <section className="page-header">
        <div className="page-header-content">
          <p className="section-label">404</p>

          <h1>Page not found</h1>

          <p>
            We could not find the page you asked for. It may have been moved, or
            the link that brought you here may be out of date.
          </p>

          <p>
            <Link to="/" className="primary-button">
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
