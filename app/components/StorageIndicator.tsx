"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function StorageIndicator() {
  const { data: session } = useSession();
  const [storage, setStorage] = useState<{ usedKB: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStorage = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/user/storage");
      if (res.ok) {
        const data = await res.json();
        setStorage({ usedKB: data.usedKB });
      }
    } catch (err) {
      console.error("Failed to fetch storage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();

    // Listen for custom events to trigger refetch
    window.addEventListener("storage-update", fetchStorage);
    return () => {
      window.removeEventListener("storage-update", fetchStorage);
    };
  }, [session]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="w-fit flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-3 shadow-xs animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-slate-200" />
        <div className="flex flex-col gap-1.5">
          <div className="w-20 h-2 bg-slate-200 rounded" />
          <div className="w-28 h-1.5 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!storage) return null;

  return (
    <div className="w-fit flex items-center gap-3.5 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm select-none transition-all duration-300 hover:shadow-md hover:border-slate-300 font-outfit">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 bg-amber-50 border border-amber-100 text-amber-500">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-space">Used Storage</span>
        <span className="text-xs font-black font-space text-slate-800">
          {storage.usedKB.toFixed(1)} KB
        </span>
      </div>
    </div>
  );
}
