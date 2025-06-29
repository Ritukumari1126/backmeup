// src/pages/HomePage.jsx
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-red-200 via-blue to-purple-300 min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-extrabold text-purple-700 mb-6 drop-shadow-md">
        Welcome to BackMeUp
      </h1>

      <p className="text-gray-700 text-lg mb-8 max-w-xl mx-auto">
        Quiet accountability. Real presence. No pressure. Partner with someone who shares your goal and stay consistent, together.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/set-goal" className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-full shadow-md">
          🎯 Set Your Goal
        </Link>
        <Link to="/match" className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-full shadow-md">
          🔗 Find a Partner
        </Link>
        <Link to="/checkin" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-full shadow-md">
          ✅ Check In
        </Link>
      </div>

      {/* <img
        src="https://cdn-icons-png.flaticon.com/512/7510/7510274.png"
        alt="growth"
        className="w-48 mx-auto mt-10 opacity-90 drop-shadow-xl"
      /> */}
    </div>
  );
}
