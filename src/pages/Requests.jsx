import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Requests() {
  const { user, userData, loading, setUserData } = useUser();
  const [requests, setRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate  = useNavigate();

  /* ─────────────────── Fetch Pending Requests ─────────────────── */
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `https://backmeup-complete-1.onrender.com/api/requests/${user.uid}`
        );
        setRequests(res.data);         // array of user objects
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
    fetchRequests();
  }, [user]);

  if (loading) return <p className="text-center mt-10">Loading…</p>;
  if (!user || !userData) return <p className="text-center mt-10">Login required.</p>;

  /* ─────────────────── Accept / Decline ─────────────────── */
  const acceptRequest = async (fromUid) => {
    setLoadingAction(true);
    try {
      await axios.post("https://backmeup-complete-1.onrender.com/api/accept-partner", {
        fromUid,
        toUid: user.uid
      });
      toast.success("🎉 You are now matched!");
      const { data: newUser } = await axios.get(
        `https://backmeup-complete-1.onrender.com/api/user/${user.uid}`
      );
      setUserData(newUser);
      navigate("/circle");
    } catch (e) {
      console.error(e);
      toast.error("Error accepting request");
    } finally {
      setLoadingAction(false);
    }
  };

  const declineRequest = async (fromUid) => {
    setLoadingAction(true);
    try {
      await axios.post("https://backmeup-complete-1.onrender.com/api/decline-request", {
        toUid: user.uid,
        fromUid
      });
      setRequests((prev) => prev.filter((r) => r.uid !== fromUid));
    } catch (e) {
      console.error("Error declining request:", e);
    } finally {
      setLoadingAction(false);
    }
  };

  /* ─────────────────── UI ─────────────────── */
  return (
    /* full-page gradient */
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-red-100 py-10 px-4">
      {/* translucent card */}
      <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">
          📥 Partner Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-center text-gray-700">No requests yet.</p>
        ) : (
          requests.map((req) => (
            <div
              key={req.uid}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow flex items-center justify-between mb-5 p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={req.photoURL || "/default-avatar.png"}
                  alt={req.name}
                  className="w-12 h-12 rounded-full border object-cover"
                />
                <div>
                  <p className="font-semibold">{req.name}</p>
                  <p className="text-sm text-gray-500">{req.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest(req.uid)}
                  disabled={loadingAction}
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => declineRequest(req.uid)}
                  disabled={loadingAction}
                  className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                >
                  ❌ Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
