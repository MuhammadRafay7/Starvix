'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  // Supabase establishes a recovery session from the link's tokens.
  // Wait for it before allowing a password update.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert('Access keys do not match.');
      return;
    }
    if (password.length < 6) {
      alert('Access key must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#334155] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-[#1E293B] border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] -mr-16 -mt-16" />

        <div className="text-center space-y-4">
          <div className="flex justify-center gap-3">
            <Terminal size={18} className="text-accent" />
            <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-bold">Security Protocol</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            New <span className="font-serif font-light lowercase text-zinc-600">key</span>
          </h1>
        </div>

        {done ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ShieldCheck size={26} className="text-accent" />
              </div>
            </div>
            <p className="text-[12px] text-zinc-300 font-light leading-relaxed px-2">
              Access key updated. You can now sign in with your new credentials.
            </p>
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <Lock size={16} /> Go to access
            </button>
          </div>
        ) : !ready ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-accent" size={26} />
            </div>
            <p className="text-[11px] text-zinc-500 font-light leading-relaxed px-2">
              Verifying recovery link. If this persists, request a fresh link from the access screen.
            </p>
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="w-full flex items-center justify-center gap-2 text-[10px] text-zinc-500 hover:text-accent uppercase font-bold tracking-[0.3em] transition-colors"
            >
              <ArrowLeft size={12} /> Back to access
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">New Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/5 p-5 rounded-2xl outline-none focus:border-accent/30 text-white font-light"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">Confirm Access Key</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-black/20 border border-white/5 p-5 rounded-2xl outline-none focus:border-accent/30 text-white font-light"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
              Update Access Key
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
