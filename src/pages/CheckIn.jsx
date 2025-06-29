import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import confetti from "canvas-confetti";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export default function CheckIn() {
  const [checkInDone, setCheckInDone] = useState(false);
  const [note, setNote] = useState("");
  const [log, setLog] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);

  const today = dayjs().format("YYYY-MM-DD"); // Ensures date matches backend format

  useEffect(() => {
    const fetchLogs = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await axios.get(`https://backmeup-complete-1.onrender.com/api/logs/${user.uid}`);
        setLog(res.data);

        const isAlreadyChecked = res.data.some(entry => entry.date === today);
        setCheckInDone(isAlreadyChecked);
      } catch (err) {
        console.error("Failed to fetch check-in logs", err);
        toast.error("Could not load logs.");
      }
    };

    fetchLogs();
  }, [today]);

  const handleCheckIn = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await axios.post("https://backmeup-complete-1.onrender.com/api/checkin", {
        uid: user.uid,
        note: note
        // Do NOT send `date` — let backend set it correctly
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);

      setLog([...log, { date: today, note }]);
      setCheckInDone(true);
      setNote("");
    } catch (err) {
      console.error("Check-in failed", err);
      toast.error("Failed to check in.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-red-100 py-10 px-4">
      <div className="p-6 max-w-xl mx-auto bg-white bg-opacity-90 shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-800">✅ Daily Check-In</h2>

        {checkInDone ? (
          <div
            className={`bg-green-100 text-green-700 p-4 rounded mb-6 text-center transition-all duration-300 ${
              showAnimation ? "animate-bounce" : ""
            }`}
          >
            You’ve already checked in today! 🌟
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <textarea
              placeholder="What did you do today? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            />
            <button
              onClick={handleCheckIn}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-all duration-200 font-semibold"
            >
              ✅ I showed up!
            </button>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
          🗓️ Your Check-in Log
        </h3>
        <ul className="space-y-2">
          {log.map((entry, idx) => (
            <li key={idx} className="bg-gray-100 p-3 rounded shadow">
              <span className="font-medium">{entry.date}</span> —{" "}
              <span className="text-gray-600">{entry.note || "✅ Showed up!"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
