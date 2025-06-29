import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { toast } from "react-toastify";

export default function Match() {
  const [goal, setGoal] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not logged in");
        return;
      }

      let currentUser = location.state?.user;

      try {
        // If not passed via navigation, fetch from backend
        if (!currentUser) {
          const userRes = await axios.get(`http://localhost:5000/api/user/${user.uid}`);
          currentUser = userRes.data;
        }

        setGoal(currentUser.goal);

        const matchRes = await axios.get(`http://localhost:5000/api/match/${user.uid}`);
        setSuggestedUsers(matchRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch partner suggestions");
      }
    };

    fetchData();
  }, [location.state]);

  const sendRequest = async (partnerUid) => {
    const user = auth.currentUser;
    if (!user) return alert("User not logged in");

    try {
      await axios.post("http://localhost:5000/api/request-partner", {
        fromUid: user.uid,
        toUid: partnerUid,
      });

      toast.success(`🤝 Partner request sent to ${partnerUid}`);
      navigate("/checkin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-blue-200 via-purple-200 to-red-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">🤝 Find Your Partner</h2>
        <p className="text-center text-gray-600 mb-8">
          Based on your goal:{" "}
          <span className="font-semibold text-purple-600">"{goal}"</span>
        </p>

        {suggestedUsers.length === 0 ? (
          <p className="text-center text-gray-500">No matching partners found yet.</p>
        ) : (
          <div className="grid gap-6">
            {suggestedUsers.map((user) => (
              <div key={user.uid} className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                )}
                <div className="flex-1">
                  <p className="text-lg font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">Goal: {user.goal}</p>
                </div>
                <button
                  onClick={() => sendRequest(user.uid)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  🤝 Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
