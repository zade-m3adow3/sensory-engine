"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import LoadingCounter from "@/components/loading/LoadingCounter";
import { useUserStore } from "@/stores/userStore";

export default function RootPage() {
  const [loading, setLoading] = useState(true);
  const [fadeWhite, setFadeWhite] = useState(false);
  const router = useRouter();
  const setProfile = useUserStore((state) => state.setProfile);
  const [nickname, setNickname] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    
    async function init() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      let hasSession = false;
      if (session) {
        hasSession = true;
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data && mounted) {
          setProfile(data);
          setNickname(data.nickname);
        }
      }

      // The animation takes 3 seconds. Let's wait slightly longer to show the 100% completion
      setTimeout(() => {
        if (!mounted) return;
        setFadeWhite(true);
        
        setTimeout(() => {
          if (!mounted) return;
          if (hasSession) {
            router.push('/tree');
          } else {
            router.push('/signup');
          }
        }, 1000); // 1s white flash duration
      }, 3500); // 3.5s loading duration
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router, setProfile]);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      <AnimatePresence>
        {!fadeWhite && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <LoadingCounter nickname={nickname} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fadeWhite && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white z-[200]"
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
