import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { Lock, UserPlus, LogIn, LogOut } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";


function Navbar() {
  const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
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

		  <Link to="/events">
            Events
          </Link>

          <Link to="/visit">
            Plan Your Visit
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