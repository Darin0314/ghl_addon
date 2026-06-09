import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Login failed');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-[#141923] border border-[#1e2535] rounded-xl w-full max-w-sm p-8 space-y-4 shadow-2xl">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-slate-500 text-sm mt-1">CADsuite Marketing</p>
        </div>
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded p-3">{error}</div>
        )}
        <div>
          <label className="block text-slate-400 text-xs mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-slate-400 text-xs mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] text-slate-200 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white text-sm font-medium rounded-lg">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
