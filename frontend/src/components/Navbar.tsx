
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  UserPlus,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const linkClass =
    "whitespace-nowrap text-sm text-white transition-opacity hover:opacity-70";

  const buttonClass =
    "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80";

  return (
    <header className="relative z-50 w-full bg-[#1d2925] py-[18px] text-white">
      <nav className="mx-auto flex w-[90%] max-w-[1200px] items-center justify-between gap-4">

        <div className="hidden shrink-0 sm:block">
          <Link to="/" className="text-white no-underline">
            <h2 className="m-0 text-2xl font-bold">
              Regional Museum
            </h2>
          </Link>
        </div>

        <div className="hidden items-center gap-5 xl:flex">
          <Link to="/" className={linkClass}>
            Home
          </Link>

          <Link to="/exhibitions" className={linkClass}>
            Exhibitions
          </Link>

          <Link to="/collections" className={linkClass}>
            Collections
          </Link>

          <Link to="/events" className={linkClass}>
            Events
          </Link>

          <Link to="/visit" className={linkClass}>
            Plan
          </Link>

          <Link
            to="/booking"
            className="nav-buy-tickets text-sm text-white transition-opacity hover:opacity-70"
          >
            Tickets
          </Link>

          <Link
            to="/membership"
            className="nav-membership text-sm text-white transition-opacity hover:opacity-70"
          >
            Membership
          </Link>

          {user && (
            <Link to="/account" className={linkClass}>
              My account
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1 rounded bg-[#263832] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              <Lock size={16} />
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              type="button"
              onClick={logout}
              className={`${buttonClass} bg-[#263832]`}
            >
              <LogOut size={16} />
              Log Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`${buttonClass} bg-[#263832]`}
              >
                <LogIn size={16} />
                Login
              </Link>
            </>
          )}

          <LanguageSwitcher />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 xl:hidden">

          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link to="/" className={linkClass}>
              Home
            </Link>

            <Link to="/exhibitions" className={linkClass}>
              Exhibitions
            </Link>

            <Link to="/collections" className={linkClass}>
              Collections
            </Link>

            <Link to="/events" className={linkClass}>
              Events
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="flex shrink-0 items-center gap-1 rounded border border-white/30 px-2 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            <span className="hidden sm:inline">Menu</span>

            <ChevronDown
              size={16}
              className={`transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="absolute right-[5%] top-full mt-1 w-60 rounded-md border border-white/10 bg-[#1d2925] p-3 text-white shadow-xl xl:hidden">

          <div className="flex flex-col gap-1">
            <Link
              to="/visit"
              onClick={closeMenu}
              className="rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              Plan Your Visit
            </Link>

            <Link
              to="/booking"
              onClick={closeMenu}
              className="rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              Tickets
            </Link>

            <Link
              to="/membership"
              onClick={closeMenu}
              className="rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              Membership
            </Link>

            {user && (
              <Link
                to="/account"
                onClick={closeMenu}
                className="rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
              >
                My Account
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
              >
                <Lock size={16} />
                Dashboard
              </Link>
            )}

            <div className="my-2 border-t border-white/20" />

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10"
              >
                <LogOut size={16} />
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <LogIn size={16} />
                  Login
                </Link>
              </>
            )}

            <div className="my-2 border-t border-white/20" />

            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
