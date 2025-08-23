'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);

  const showNotification = (msg: string, type: "error" | "success" = "error") => {
    if (type === "error") setError(msg);
    else setMessage(msg);
    setTimeout(() => { setError(""); setMessage(""); }, 4000);
  };

  // Update or create user in Firestore
  const updateFirestoreUser = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const data = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "No Name",
      role: "student",
      lastLogin: serverTimestamp(),
    };

    if (userSnap.exists()) {
      await setDoc(userRef, data, { merge: true }); // update existing
    } else {
      await setDoc(userRef, { ...data, createdAt: serverTimestamp() }); // create new
    }
  };

  // Email login
  const handleEmailLogin = async () => {
    setLoading(true); setError(""); setMessage("");

    if (!email || !password) {
      showNotification("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        showNotification("Email not verified. Check your inbox.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      await updateFirestoreUser(user);
      router.push("/dashboard"); // redirect to dashboard for all users

    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          showNotification("User not found. Please signup first.");
          break;
        case "auth/wrong-password":
          showNotification("Incorrect password.");
          break;
        case "auth/invalid-email":
          showNotification("Invalid email format.");
          break;
        default:
          showNotification("Login failed. Try again.");
      }
    } finally { setLoading(false); }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true); setError(""); setMessage("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await updateFirestoreUser(user);
      router.push("/dashboard"); // redirect to dashboard for all users
    } catch (err) {
      showNotification("Google login failed.");
      console.error(err);
    } finally { setLoading(false); }
  };

  // Password reset
  const handlePasswordReset = async () => {
    if (!email) { showNotification("Enter your email first."); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showNotification("Password reset email sent!", "success");
    } catch (err) {
      showNotification("Failed to send reset email.");
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Animated background */}
      <motion.div className="absolute w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[150px]"
        animate={{ x: [0, 30, -30, 0], y: [0, -20, 20, 0], scale: [1, 1.05, 1, 0.98, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "20%", left: "30%" }}
      />
      <motion.div className="absolute w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[200px]"
        animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0], scale: [1, 1.02, 1, 0.98, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "10%", right: "20%" }}
      />

      {/* Login Card */}
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md p-10 bg-black/70 border border-yellow-500/50 rounded-3xl shadow-2xl backdrop-blur-md"
      >
        <h2 className="text-4xl font-bold text-center text-yellow-400 mb-6">Welcome Back</h2>

        {!useEmail && (
          <>
            <button onClick={handleGoogleLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-yellow-500 rounded-xl font-semibold text-black hover:bg-yellow-600 shadow-lg hover:scale-105 transition transform disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Continue with Google
            </button>
            <p className="text-center text-yellow-400 mt-4 cursor-pointer hover:underline" onClick={() => setUseEmail(true)}>
              Login with Email
            </p>
          </>
        )}

        {useEmail && (
          <div className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-yellow-300 border border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition shadow-inner"
            />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-yellow-300 border border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition shadow-inner"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}

            <button onClick={handleEmailLogin} disabled={loading}
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-600 shadow-lg hover:scale-105 transition transform disabled:opacity-50">
              {loading ? "Loading..." : "Login with Email"}
            </button>

            <div className="text-center mt-2">
              <button onClick={handlePasswordReset} className="text-yellow-400 hover:underline text-sm">
                Forgot Password?
              </button>
            </div>

            <p className="text-center text-red-400 mt-4 cursor-pointer hover:underline" onClick={() => router.push("/auth/admin/login")}>
              Login as Admin
            </p>

            <p className="text-center text-yellow-400 mt-4 cursor-pointer hover:underline" onClick={() => setUseEmail(false)}>
              Use Google Login Instead
            </p>
          </div>
        )}

        <p className="text-center text-yellow-400 mt-6 text-sm">
          Don't have an account? <a href="/auth/signup" className="font-semibold hover:underline">Sign Up</a>
        </p>
      </motion.div>
    </main>
  );
}
