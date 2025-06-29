import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { toast } from "react-toastify";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function DailyInsight() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");

  const fetchInsight = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.warn("Please login first!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${BACKEND}/api/ai-summary`, { uid });
      setSummary(data.summary);
      setSuggestion(data.suggestion);
    } catch (err) {
      console.error("❌ Insight error:", err.response?.data || err.message);
      setError("Could not generate insight. Please try again later.");
      toast.error("Failed to generate insight.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) fetchInsight();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-red-100 p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-6 border border-purple-200">
        <h1 className="text-3xl font-bold text-center text-purple-700">Daily Insight</h1>

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Thinking…</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            <div className="bg-purple-50 border border-purple-200 p-5 rounded-lg overflow-auto">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">🔍 Summary:</h2>
              <pre className="whitespace-pre-wrap text-gray-800 font-mono">{summary}</pre>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-green-700 mb-2">🧠 AI Suggestion for Tomorrow:</h2>
              <p className="italic text-green-800">💡 {suggestion}</p>
            </div>
          </>
        )}

        <button
          onClick={fetchInsight}
          disabled={loading}
          className="mx-auto block px-6 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          🔄 {loading ? "Generating…" : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
