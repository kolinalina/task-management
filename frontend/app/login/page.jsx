'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { Loader2, CheckSquare } from 'lucide-react';

export default function LoginPage() {
    const [form, setForm]       = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router                = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Toaster position="top-right" richColors />

            <div className="w-full max-w-md px-4">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <CheckSquare className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">TaskFlow</span>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>Sign in to your account to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : 'Sign In'}
                            </Button>
                        </form>

                        {/* Test credentials */}
                        <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Test credentials:</p>
                            <p className="text-xs text-muted-foreground">Email: admin@test.com</p>
                            <p className="text-xs text-muted-foreground">Password: password123</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}