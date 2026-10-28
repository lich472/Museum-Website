import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { Lock, UserPlus, LogIn, LogOut } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";


function Navbar() {
  const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";

  /*
   * Narrow-screen menu state.
   *
   * The collapsing itself is CSS (the "Responsive navigation" block in App.css,
   * 900px breakpoint): below that width .nav-links is display:none, the
   * .nav-toggle button is shown, and .is-open brings the panel back. Above the
   * breakpoint the button is hidden and this state has no effect, so there is
   * nothing to keep in sync with a resize.
   *
   * The button is a real <button>, so it is keyboard operable and reports its
   * state through aria-expanded without any extra work.
   */
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the panel after navigating. Without this it stays open over the page
  // you just moved to, which reads as a broken menu on a phone.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="navbar">
      <nav className="nav-container">

        <div className="museum-logo">
          <Link to="/">
            {/*
              Was an <h2>, which made the navbar logo the first heading on
              every route and pushed the outline to h2 → h1 before the page's
              own <h1> was even reached. It is decorative branding, not a
              section of the document, so it is a plain <span> now.

              The 24px size is inline because it used to come from
              `.museum-logo h2` in App.css; a <p> here would instead match
              `.museum-logo p` (12px, letterspaced) and shrink the logo.
            */}
            <span style={{ fontSize: "24px" }}>Regional Museum</span>
            <p>History • Culture • Discovery</p>
          </Link>
        </div>

        {/* Hidden by CSS above 900px, where the links are always visible. */}
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>

        <div
          id="primary-navigation"
          className={`nav-links${menuOpen ? " is-open" : ""}`}
        >
          <Link to="/">Home</Link>

          <Link to="/exhibitions">
            Exhibitions
          </Link>

          <Link to="/collections">
            Collections
          </Link>

		  <Link to="/events">
            Events
          </Link>

          <Link to="/visit">
            Plan Your Visit
          </Link>

          {/* Carried over from the Jason_P5 branch */}
          <Link to="/accessibility">
            Accessibility
          </Link>

          <Link to="/facilities">
            Facilities
          </Link>

          <Link className="nav-buy-tickets" to="/booking">Buy Tickets</Link>
          <Link className="nav-membership" to="/membership">Membership</Link>

		  	{user && (
				<Link
					to="/account"
					className="text-sm font-medium text-[var(--color-primary)] hover:underline"
				>
					My account
				</Link>
			)}

		  	{isAdmin && (
				<Link
					className='bg-black hover:bg-gray-500 text-white px-3 py-1 rounded-md font-medium
						transition duration-300 ease-in-out flex items-center'
					to={"/admin"}
				>
					<Lock className='inline-block mr-1' size={18} />
					<span className='hidden sm:inline'>Dashboard</span>
				</Link>
			)}

          	{user ? (
				<button
					className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
				rounded-md flex items-center transition duration-300 ease-in-out'
					onClick={logout}
				>
					<LogOut size={18} />
					<span className='hidden sm:inline ml-2'>Log Out</span>
				</button>
				) : (
				<>
					<Link
						to={"/signup"}
						className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out'
					>
						<UserPlus className='mr-2' size={18} />
						Sign Up
					</Link>
					<Link
						to={"/login"}
						className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out'
					>
						<LogIn className='mr-2' size={18} />
						Login
					</Link>
				</>
			)}

			<LanguageSwitcher />

        </div>

      </nav>
    </header>
  );
}

export default Navbar;
