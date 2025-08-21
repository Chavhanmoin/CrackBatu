'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Animated Glowing Blob */}
      <motion.div
        className="absolute w-[700px] h-[700px] bg-yellow-500/20 blur-[180px] rounded-full"
        animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0], scale: [1, 1.05, 1, 0.98, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "30%", left: "50%", translateX: "-50%", translateY: "-50%" }}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center space-y-6 max-w-2xl"
      >
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-yellow-500 drop-shadow-lg">
          CrackBatu DBATU
        </h1>

        {/* Description */}
        <p className="text-white text-lg md:text-xl">
          Centralized web platform for all engineering students of Dr. Babasaheb Ambedkar Technological University.
          Access PYQs, study resources, and departmental materials from a single hub.
        </p>

        {/* Login Button */}
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-6 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Login
        </button>

        {/* Footer / Credit */}
        <p className="text-white/70 mt-6 text-sm">
          © 2025 CrackBatu. All rights reserved.
        </p>
      </motion.div>
    </main>
  );
}
