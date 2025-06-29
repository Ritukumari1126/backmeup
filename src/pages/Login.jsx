import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const registerUserInBackend = async (user) => {
    await axios.post("https://backmeup-complete-1.onrender.com/api/register-user", {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      photoURL: user.photoURL
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userCred;
      if (isLogin) {
        userCred = await signInWithEmailAndPassword(auth, email, pass);
      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, pass);
      }
      await registerUserInBackend(userCred.user);
      navigate("/set-goal");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await registerUserInBackend(result.user);
      navigate("/set-goal");
    } catch (err) {
      console.log("Google Sign-in failed: " + err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.warn("Enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-500 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-shadow duration-300">
        <div className="bg-black w-[450px] rounded-xl p-8 space-y-6 shadow-xl">
          <h2 className="text-2xl font-bold text-center text-white">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white mb-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-black text-white border border-gray-600 rounded px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-black text-white border border-gray-600 rounded px-3 py-2 pr-10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
                <div
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
                >
                  {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Neon glowing gradient button */}
            <button
              type="submit"
              className="w-full py-2 font-semibold text-white bg-gradient-to-r from-pink-500  to-purple-500 rounded-lg shadow-[0_0_10px_rgba(255,0,255,0.7)] hover:shadow-[0_0_40px_rgba(255,0,255,1)] transition duration-300"
            >
              {isLogin ? "Continue" : "Sign Up"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <hr className="w-full border-gray-700" />
            <span className="text-sm text-gray-500">OR</span>
            <hr className="w-full border-gray-700" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-600 py-2 rounded flex items-center justify-center gap-2 text-white hover:bg-gray-800 transition duration-200"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
