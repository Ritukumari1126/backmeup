import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { toast } from "react-toastify";

export default function Circle() {
  const [myLogs, setMyLogs] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userUid, setUserUid] = useState("");

  /* ───────────────────────── FETCH DATA ───────────────────────── */
  useEffect(() => {
    const fetchCircle = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setUserUid(user.uid);

      try {
        const { data: curUser } = await axios.get(
          `https://backmeup-complete-1.onrender.com/api/user/${user.uid}`
        );
        const { data: myLogsData } = await axios.get(
          `https://backmeup-complete-1.onrender.com/api/logs/${user.uid}`
        );
        setMyLogs(myLogsData);

        const partnerData = await Promise.all(
          (curUser.matchedWith || []).map(async (uid) => {
            const [uRes, lRes] = await Promise.all([
              axios.get(`https://backmeup-complete-1.onrender.com/api/user/${uid}`),
              axios.get(`https://backmeup-complete-1.onrender.com/api/logs/${uid}`)
            ]);
            return {
              name: uRes.data.name,
              uid,
              photoURL: uRes.data.photoURL,
              logs: lRes.data
            };
          })
        );

        setPartners(partnerData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading pod", err);
      }
    };
    fetchCircle();
  }, []);

  /* ───────────────────────── REACTIONS ───────────────────────── */
  const handleReaction = async (logId, emoji) => {
    try {
      await axios.post("https://backmeup-complete-1.onrender.com/api/react", {
        logId,
        uid: userUid,
        emoji
      });

      // refresh my logs
      const { data: updatedMyLogs } = await axios.get(
        `https://backmeup-complete-1.onrender.com/api/logs/${userUid}`
      );
      setMyLogs(updatedMyLogs);

      // refresh partner logs
      const refreshed = await Promise.all(
        partners.map(async (p) => {
          const { data: updatedLogs } = await axios.get(
            `https://backmeup-complete-1.onrender.com/api/logs/${p.uid}`
          );
          return { ...p, logs: updatedLogs };
        })
      );
      setPartners(refreshed);
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  /* ───────────────────────── RENDER HELPERS ───────────────────────── */
  const renderLog = (log, isMe = false) => (
    <li
      key={log._id}
      className={`p-4 rounded-xl shadow ${isMe ? "bg-green-50/80" : "bg-white/80"
        } backdrop-blur-sm`}
    >
      <div className="text-sm text-gray-700">
        <strong>{log.date}</strong>: {log.note || "✅ Showed up!"}
      </div>

      <div className="mt-2 flex gap-2 text-xl">
        {log.uid !== userUid &&
          ["👏", "💪", "🔥"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(log._id, emoji)}
              className="hover:scale-110 transition"
            >
              {emoji}
            </button>
          ))}

        {log.reactions &&
          Object.entries(log.reactions).map(([uid, emoji], i) => (
            <span
              key={i}
              className="text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
            >
              {emoji}
            </span>
          ))}
      </div>
    </li>
  );

  /* ───────────────────────── UI ───────────────────────── */
  return (
    /* Full-page gradient */
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-red-100 py-10 px-4">
      {/* translucent card for readability */}
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-800">
          Your Support Circle
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading…</p>
        ) : (
          <>
            {/* ───── My Logs ───── */}
            <section className="mb-12">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                🧍‍♂️ Your Logs
              </h3>
              {myLogs.length === 0 ? (
                <p className="text-gray-600">No check-ins yet.</p>
              ) : (
                <ul className="space-y-3">
                  {myLogs.map((log) => renderLog(log, true))}
                </ul>
              )}
            </section>

            {/* ───── Partner Logs ───── */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                👥 Partner Logs
              </h3>
              {partners.length === 0 ? (
                <p className="text-gray-600">No partners connected yet.</p>
              ) : (
                partners.map((p) => (
                  <div key={p.uid} className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                      {p.photoURL && (
                        <img
                          src={p.photoURL}
                          alt={p.name}
                          className="w-10 h-10 rounded-full border"
                        />
                      )}
                      <h4 className="text-lg font-semibold">{p.name}'s Logs</h4>
                    </div>
                    {p.logs.length === 0 ? (
                      <p className="text-sm text-gray-600">No check-ins yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {p.logs.map((log) => renderLog(log))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
