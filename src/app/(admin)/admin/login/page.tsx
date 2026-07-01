'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Loader2, ArrowLeft, MailCheck } from 'lucide-react';

type Mode = 'login' | 'reset';

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setSent(false);
    setPassword('');
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
            {mode === 'login' ? (
              <>System <span className="font-serif font-light lowercase text-zinc-600">access</span></>
            ) : (
              <>Reset <span className="font-serif font-light lowercase text-zinc-600">key</span></>
            )}
          </h1>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">Identifier</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/5 p-5 rounded-2xl outline-none focus:border-accent/30 text-white font-light"
                placeholder="admin@studio.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Initialize Session
            </button>

            <button
              type="button"
              onClick={() => switchMode('reset')}
              className="w-full text-center text-[10px] text-zinc-500 hover:text-accent uppercase font-bold tracking-[0.3em] transition-colors"
            >
              Forgot access key?
            </button>
          </form>
        )}

        {mode === 'reset' && !sent && (
          <form onSubmit={handleReset} className="space-y-6">
            <p className="text-center text-[11px] text-zinc-500 font-light leading-relaxed px-2">
              Enter your identifier and we&apos;ll send a recovery link to reset your access key.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">Identifier</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/5 p-5 rounded-2xl outline-none focus:border-accent/30 text-white font-light"
                placeholder="admin@studio.com"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <MailCheck size={16} />}
              Send Recovery Link
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full flex items-center justify-center gap-2 text-[10px] text-zinc-500 hover:text-accent uppercase font-bold tracking-[0.3em] transition-colors"
            >
              <ArrowLeft size={12} /> Back to access
            </button>
          </form>
        )}

        {mode === 'reset' && sent && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <MailCheck size={26} className="text-accent" />
              </div>
            </div>
            <p className="text-[12px] text-zinc-300 font-light leading-relaxed px-2">
              Recovery link dispatched to <span className="text-white font-medium">{email}</span>. Check your inbox to set a new access key.
            </p>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full flex items-center justify-center gap-2 text-[10px] text-zinc-500 hover:text-accent uppercase font-bold tracking-[0.3em] transition-colors"
            >
              <ArrowLeft size={12} /> Back to access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
