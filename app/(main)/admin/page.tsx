"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import RippleWrapper from "@/components/ui/RippleWrapper";

export default function AdminPage() {
  const profile = useUserStore(state => state.profile);
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // If not admin, boot them
    if (profile && !profile.is_superadmin) {
      router.push("/tree");
    }
    
    // In a real app, fetch users from Supabase here
    setUsers([
      { id: "1", nickname: "Mom", type: "Parent", score: 150, joined: "2023-10-01" },
      { id: "2", nickname: "My Love", type: "Partner", score: 180, joined: "2023-10-05" },
      { id: "3", nickname: "Bestie Anna", type: "Friend", score: 120, joined: "2023-10-10" },
    ]);
  }, [profile, router]);

  if (!profile || !profile.is_superadmin) return <div className="min-h-screen" />;

  return (
    <main className="min-h-screen p-8 pt-24 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-space-grotesk font-bold text-white mb-2">Command Center</h1>
          <p className="text-white/60 font-inter">Manage your connections, audio logs, and AI memory.</p>
        </div>
        <RippleWrapper as="button" onClick={() => router.push("/tree")} className="px-6 py-2 rounded-full border border-white/20 text-white/70 hover:bg-white/10">
          Back to Tree
        </RippleWrapper>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-white/50 font-inter font-medium text-sm">Nickname</th>
                <th className="p-4 text-white/50 font-inter font-medium text-sm">Relationship</th>
                <th className="p-4 text-white/50 font-inter font-medium text-sm">Priority Score</th>
                <th className="p-4 text-white/50 font-inter font-medium text-sm">Joined</th>
                <th className="p-4 text-white/50 font-inter font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{u.nickname}</td>
                  <td className="p-4 text-white/70">{u.type}</td>
                  <td className="p-4 text-white/70">
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden max-w-[100px]">
                      <div className="bg-indigo-500 h-full" style={{ width: `${(u.score / 200) * 100}%` }} />
                    </div>
                  </td>
                  <td className="p-4 text-white/70">{u.joined}</td>
                  <td className="p-4">
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mr-3">Edit</button>
                    <button className="text-rose-400 hover:text-rose-300 text-sm font-medium">Reset AI</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
