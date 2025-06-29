import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import { toast } from "react-toastify";

export default function SetGoal() {
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("User not logged in.");

    try {
      // 1. Save goal to backend
      await axios.post("https://backmeup-complete-1.onrender.com/api/set-goal", {
        uid: user.uid,
        goal,
      });

      // 2. Fetch updated user
      const res = await axios.get(`https://backmeup-complete-1.onrender.com/api/user/${user.uid}`);
      const updatedUser = res.data;

      // 3. Navigate to match with updated goal
      toast.success("🎯 Goal saved!");
      navigate("/match", { state: { user: updatedUser } });

    } catch (err) {
      console.error("Save goal error:", err.response?.data || err.message || err);
      toast.error(err.response?.data?.message || "Failed to save goal.");
    }


  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-red-100 px-4">
      <div className="backdrop-blur-md bg-white/70 shadow-xl border border-white/30 rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🎯 Set Your Main Goal
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            placeholder="e.g. Crack GATE 2026"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow hover:shadow-lg"
          >
            Save Goal & Find Partner
          </button>
        </form>
      </div>
    </div>
  );
}
