import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Redirect to homepage
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 px-4 py-2 text-white rounded">
      Logout
    </button>
  );
}
