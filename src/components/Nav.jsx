// src/components/Nav.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useUser } from "../context/UserContext";
import logo from "../assets/logo.png";

export default function Nav() {
  const { user, userData } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    auth.signOut();
    navigate("/");
  };

  const isActive = (path) =>
    pathname === path ? "text-purple-600 text-lg font-semibold underline" : "text-white font-semibold text-lg hover:underline";

  return (
    <nav className="bg-gradient-to-r from-indigo-400 via-pink-300   to-purple-400 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto  flex justify-between items-center">
        <Link to="/" className="flex items-center ">
          <img src={logo} alt="BackMeUp Logo" className="w-20 h-20 object-contain" />
          <span className="text-2xl font-bold text-white hidden sm:inline">BackMeUp</span>
        </Link>


        <div className="flex  items-center gap-5 text-sm md:text-base">
          {user && (
            <>
              <Link to="/set-goal" className={isActive("/set-goal")}>Set Goal</Link>
              <Link to="/match" className={isActive("/match")}>Match</Link>
              <Link to="/checkin" className={isActive("/checkin")}>Check-In</Link>
              <Link to="/circle" className={isActive("/circle")}>Circle</Link>
              <Link to="/requests" className={isActive("/requests")}>Requests</Link>
              <Link to="/chat" className={isActive("/chat")}>Chat</Link>
              <Link to="/focus" className={isActive("/focus")}>Focus Timer</Link>
              <Link to="/insight" className={isActive("/insight")}>Daily Insight</Link>


            </>
          )}

          {userData?.photoURL && (
            <img
              src={userData.photoURL}
              alt="profile"
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
            />
          )}
          {userData?.name && (
            <span className="text-white font-medium hidden sm:inline-block">
              {userData.name.split(" ")[0]}
            </span>
          )}

          {user ? (
            <button
              onClick={logout}
              className="bg-pink-500 hover:bg-pink-600 hover:rounded-full  text-white px-4 py-2 rounded font-bold"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-gray-100 font-bold hover:rounded-full">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
