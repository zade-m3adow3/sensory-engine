"use client";

import { useEffect, useState } from "react";
import LoadingCounter from "@/components/loading/LoadingCounter";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/stores/userStore";

export default function Loading() {
  const [loading, setLoading] = useState(true);
  const { profile } = useUserStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500); // Wait for the 3s counter + a little delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <LoadingCounter nickname={profile?.nickname} />
          
          {/* Flash Effect when hitting 100% */}
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 0] }}
            transition={{ duration: 3.5, times: [0, 0.85, 0.9, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
