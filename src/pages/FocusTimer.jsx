import { useState, useRef } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { toast } from "react-toastify";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function FocusTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const intervalRef = useRef();

  const toggle = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setRunning(true);
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(0);
  };

  const saveSession = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return toast.warn("Please login first!");

    const minutes = Math.round(seconds / 60);
    console.log("➡️ Saving:", { uid, duration: minutes, task });

    try {
      await axios.post(`${BACKEND}/api/focus-log`, {
        uid,
        duration: minutes,
        task,
      });
      toast.success(`Logged ${minutes} min`);
      reset();
    } catch (err) {
      console.error("❌ Save failed:", err.response?.data || err.message);
      toast.error("Failed to save focus session");
    }
  };

  const pretty = new Date(seconds * 1000).toISOString().substr(11, 8);
  const canSave = seconds >= 5;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-red-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 border border-purple-200">
        <h2 className="text-2xl font-bold text-purple-700 text-center">
          Focus Timer
        </h2>

        <div className="text-5xl font-mono text-center tracking-widest">
          {pretty}
        </div>

        <input
          placeholder="Task label (optional)"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-purple-300"
        />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={toggle}
            className={`px-4 py-2 rounded font-semibold ${
              running ? "bg-yellow-500" : "bg-green-600"
            } text-white hover:opacity-90`}
          >
            {running ? "Pause" : "Start"}
          </button>

          <button
            onClick={reset}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 font-semibold"
          >
            Reset
          </button>

          <button
            onClick={saveSession}
            disabled={!canSave}
            className="px-4 py-2 rounded bg-purple-600 text-white font-semibold disabled:opacity-50 hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
