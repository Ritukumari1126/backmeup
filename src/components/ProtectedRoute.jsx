import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [userChecked, setUserChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthenticated(!!user);
      setUserChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!userChecked) {
    return <div className="text-center mt-10">Checking authentication...</div>;
  }

  return authenticated ? children : <Navigate to="/login" />;
}
