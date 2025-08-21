'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[@$!%*?&]/.test(pass)) strength++;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
      case 2: return "bg-red-500";
      case 3:
      case 4: return "bg-yellow-400";
      case 5: return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSignup = async () => {
    setError(""); setMessage(""); setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required."); setLoading(false); return;
    }
    if (!isValidEmail(email)) { setError("Invalid email."); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }
    if (passwordStrength < 4) { setError("Password too weak."); setLoading(false); return; }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Create Firestore record immediately
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        role: "student",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      setMessage("Signup successful! Verification email sent. Please verify before login.");
      setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
      setTimeout(() => router.push("/auth/login"), 5000);

    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("Email already in use.");
      else if (err.code === "auth/weak-password") setError("Password too weak.");
      else setError("An unknown error occurred.");
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setLoading(true); setError(""); setMessage("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const data = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "No Name",
        role: "student",
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      if (userSnap.exists()) {
        await setDoc(userRef, { ...data, lastLogin: serverTimestamp() }, { merge: true });
      } else {
        await setDoc(userRef, data);
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Google signup failed.");
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      <motion.div className="absolute w-[600px] h-[600px] bg-yellow-500/20 blur-[180px] rounded-full" animate={{ x: [0, 40, -40, 0], y: [0, -30, 30, 0], scale: [1, 1.05, 1, 0.98, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
      <motion.div className="absolute w-[400px] h-[400px] bg-yellow-400/10 blur-[120px] rounded-full" animate={{ x: [0, -50, 50, 0], y: [0, 25, -25, 0], scale: [1, 1.1, 1, 0.95, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }} style={{ top: "20%", left: "30%", transform: "translate(-50%, -50%)" }} />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md p-8 space-y-6 bg-black/80 border border-yellow-500/50 rounded-2xl shadow-lg backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center text-yellow-400">Create an Account</h1>

        <div className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-md bg-black/50 border border-yellow-500/50 text-yellow-300 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-md bg-black/50 border border-yellow-500/50 text-yellow-300 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-md bg-black/50 border border-yellow-500/50 text-yellow-300 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-500">{showPassword ? "Hide" : "Show"}</button>
            {password.length > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <div className="h-2 w-full bg-yellow-900/50 rounded-full">
                  <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                </div>
                <span className="ml-2 text-xs text-yellow-400">{["Very Weak","Weak","Medium","Good","Strong","Very Strong"][passwordStrength]}</span>
              </div>
            )}
          </div>

          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 rounded-md bg-black/50 border border-yellow-500/50 text-yellow-300 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>

        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        {message && <p className="text-sm text-center text-green-500">{message}</p>}

        <button onClick={handleEmailSignup} disabled={loading} className="w-full py-2 font-semibold text-black bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors">{loading ? "Creating Account..." : "Sign Up"}</button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-yellow-500/30"></div>
          <span className="mx-4 text-yellow-400 text-sm">or</span>
          <div className="flex-grow border-t border-yellow-500/30"></div>
        </div>

        <button onClick={handleGoogleSignup} disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 border border-yellow-500/50 hover:bg-white/20 rounded-md text-yellow-400 font-semibold disabled:opacity-50 transition-colors">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center text-sm text-yellow-400 mt-4">Already have an account? <a href="/auth/login" className="font-semibold text-yellow-300 hover:underline">Login</a></p>
      </motion.div>
    </main>
  );
}
