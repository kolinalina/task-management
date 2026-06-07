'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Toaster, toast } from 'sonner';
import { Loader2, Zap, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const [form, setForm]         = useState({ email: '', password: '' });
    const [loading, setLoading]   = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused]   = useState('');
    const [mounted, setMounted]   = useState(false);
    const router                  = useRouter();

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

return (
    <div style={{
        minHeight: '100vh',
        background: '#080812',  // ← ganti ini jadi lebih dark navy
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
    }}>
        <Toaster position="top-right" richColors theme="dark" />

        {/* Hapus mesh gradient div yang lama, ganti dengan ini: */}

        {/* Aurora effect */}
        <div style={{
            position: 'absolute', inset: 0,
            background: `
                radial-gradient(ellipse 120% 80% at 20% 20%, rgba(99,102,241,0.18) 0%, transparent 50%),
                radial-gradient(ellipse 80% 60% at 80% 80%, rgba(139,92,246,0.15) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 60% 10%, rgba(59,130,246,0.1) 0%, transparent 50%)
            `,
        }} />

        {/* Animated orbs — lebih besar & lebih terang */}
        <div style={{
            position: 'absolute', top: '-150px', left: '-150px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)',
            filter: 'blur(80px)',
            animation: 'float1 10s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', bottom: '-150px', right: '-150px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 60%)',
            filter: 'blur(80px)',
            animation: 'float2 12s ease-in-out infinite',
        }} />
        <div style={{
            position: 'absolute', top: '30%', right: '-100px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'float1 15s ease-in-out infinite reverse',
        }} />
        <div style={{
            position: 'absolute', bottom: '20%', left: '-50px',
            width: '350px', height: '350px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'float2 18s ease-in-out infinite reverse',
        }} />

        {/* Dot grid dengan mask */}
        <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
        }} />

        {/* Horizontal streaks */}
        <div style={{
            position: 'absolute', top: '28%', left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), rgba(139,92,246,0.3), rgba(99,102,241,0.2), transparent)',
        }} />
        <div style={{
            position: 'absolute', bottom: '28%', left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.15), rgba(99,102,241,0.2), rgba(59,130,246,0.15), transparent)',
        }} />



            <style>{`
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(20px, -15px) scale(1.03); }
                    66% { transform: translate(-10px, 10px) scale(0.98); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-15px, 20px) scale(1.04); }
                    66% { transform: translate(10px, -10px) scale(0.97); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .login-card {
                    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .input-field:focus {
                    border-color: rgba(99,102,241,0.5) !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important;
                }
                .input-field { transition: all 0.2s ease !important; }
                .sign-btn:hover { opacity: 0.92; transform: translateY(-1px); }
                .sign-btn { transition: all 0.2s ease; }
                .sign-btn:active { transform: translateY(0px); }
            `}</style>

            {/* Main card */}
            <div className="login-card" style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '400px',
                margin: '0 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '40px',
                backdropFilter: 'blur(24px)',
            }}>
                {/* Top accent line */}
                <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
                    borderRadius: '1px',
                }} />

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                    }}>
                        <Zap size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' }}>
                        TaskFlow
                    </span>
                </div>

                {/* Heading */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                        Sign in
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontWeight: '400', lineHeight: '1.5' }}>
                        New to TaskFlow?{' '}
                        <span style={{ color: 'rgba(99,102,241,0.9)', fontWeight: '500', cursor: 'pointer' }}>
                            Create an account
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block', fontSize: '12px', fontWeight: '500',
                            color: focused === 'email' ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.45)',
                            marginBottom: '8px', transition: 'color 0.2s',
                            letterSpacing: '0.3px',
                        }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused('')}
                            required
                            className="input-field"
                            style={{
                                width: '100%', padding: '11px 14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px', color: '#fff',
                                fontSize: '14px', outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '12px', fontWeight: '500',
                            color: focused === 'password' ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.45)',
                            marginBottom: '8px', transition: 'color 0.2s',
                            letterSpacing: '0.3px',
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused('')}
                                required
                                className="input-field"
                                style={{
                                    width: '100%', padding: '11px 42px 11px 14px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px', color: '#fff',
                                    fontSize: '14px', outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.3)', padding: '2px',
                                    display: 'flex', alignItems: 'center',
                                }}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="sign-btn"
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', borderRadius: '12px',
                            color: '#fff', fontSize: '14px', fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
                        }}
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                        ) : 'Sign in to TaskFlow →'}
                    </button>
                </form>

                {/* Features */}
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Real-time task updates', 'File attachments & comments', 'Team collaboration'].map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={13} style={{ color: 'rgba(99,102,241,0.7)', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: '400' }}>{f}</span>
                        </div>
                    ))}
                </div>

                {/* Test credentials */}
                <div style={{
                    marginTop: '20px', padding: '10px 14px',
                    background: 'rgba(99,102,241,0.05)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: '10px',
                }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                        Test account:{' '}
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>admin@test.com</span>
                        {' '}·{' '}
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>password123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}