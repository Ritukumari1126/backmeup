import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import SetGoal from "./pages/SetGoal";
import Match from "./pages/Match";
import CheckIn from "./pages/CheckIn";
import Circle from "./pages/Circle";
import Requests from "./pages/Requests";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage"; // ✅ New
import ChatPage from "./pages/ChatPage";
import FocusTimer from "./pages/FocusTimer";
import DailyInsight from "./pages/DailyInsight";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Nav />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-goal" element={<ProtectedRoute><SetGoal /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><Match /></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
        <Route path="/circle" element={<ProtectedRoute><Circle /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/focus" element={<ProtectedRoute><FocusTimer /></ProtectedRoute>} />
        <Route path="/insight" element={<ProtectedRoute><DailyInsight /></ProtectedRoute>} />


      </Routes>
    </div>
  );
}
