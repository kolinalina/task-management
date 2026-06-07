'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import {
    Loader2, Plus, Trash2, LogOut, Zap,
    CheckCircle2, Clock, AlertCircle, LayoutGrid,
    Search, ChevronDown, Calendar,
} from 'lucide-react';

export default function Dashboard() {
    const [tasks, setTasks]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState({ status: '', priority: '', search: '' });
    const [open, setOpen]       = useState(false);
    const [user, setUser]       = useState(null);
    const [newTask, setNewTask] = useState({
        title: '', description: '', priority: 'medium', status: 'todo', due_date: ''
    });
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        setUser(JSON.parse(stored));
        fetchTasks();
    }, []);

    useEffect(() => { fetchTasks(); }, [filter]);

    const fetchTasks = async () => {
        try {
            const params = {};
            if (filter.status)   params.status   = filter.status;
            if (filter.priority) params.priority  = filter.priority;
            if (filter.search)   params.search    = filter.search;
            const res = await api.get('/tasks', { params });
            setTasks(res.data.data);
        } catch {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', newTask);
            toast.success('Task created!');
            setOpen(false);
            setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '' });
            fetchTasks();
        } catch {
            toast.error('Failed to create task');
        }
    };

    const deleteTask = async (id) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success('Task deleted');
            fetchTasks();
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.clear();
        router.push('/login');
    };

    const stats = {
        total:       tasks.length,
        todo:        tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done:        tasks.filter(t => t.status === 'done').length,
    };

    const priorityConfig = {
        low:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)'  },
        medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)'  },
        high:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
    };

    const statusConfig = {
        todo:        { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Todo',        icon: <Clock size={11} />        },
        in_progress: { color: '#818cf8', bg: 'rgba(129,140,248,0.12)', label: 'In Progress', icon: <AlertCircle size={11} /> },
        done:        { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: 'Done',        icon: <CheckCircle2 size={11} /> },
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px', color: '#fff',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#13131f',
            fontFamily: 'Inter, sans-serif',
            color: '#fff',
        }}>
            <Toaster position="top-right" richColors theme="dark" />

            {/* Background glow */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse 80% 50% at 10% 10%, rgba(99,102,241,0.15) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 40% at 90% 90%, rgba(139,92,246,0.12) 0%, transparent 60%)
                `,
            }} />

            {/* Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(19,19,31,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                padding: '0 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: '56px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={15} color="white" />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px' }}>TaskFlow</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                    }}>
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '600',
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{user?.name}</span>
                    </div>
                    <button onClick={logout} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', fontSize: '13px', cursor: 'pointer',
                    }}>
                        <LogOut size={13} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px', color: '#fff' }}>
                            My Tasks
                        </h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 18px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', color: '#fff',
                            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                        }}
                    >
                        <Plus size={16} /> New Task
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Tasks',  value: stats.total,       icon: <LayoutGrid size={16} />,   color: '#818cf8' },
                        { label: 'Todo',         value: stats.todo,        icon: <Clock size={16} />,         color: '#94a3b8' },
                        { label: 'In Progress',  value: stats.in_progress, icon: <AlertCircle size={16} />,  color: '#818cf8' },
                        { label: 'Completed',    value: stats.done,        icon: <CheckCircle2 size={16} />, color: '#4ade80' },
                    ].map(s => (
                        <div key={s.label} style={{
                            padding: '18px 20px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>{s.label}</span>
                                <span style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <span style={{ fontSize: '30px', fontWeight: '800', color: '#fff' }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                            placeholder="Search tasks..."
                            onChange={e => setFilter({...filter, search: e.target.value})}
                            style={{
                                width: '100%', padding: '8px 12px 8px 34px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '8px', color: '#fff',
                                fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    {[
                        { key: 'status',   options: ['All Status',   'todo', 'in_progress', 'done'] },
                        { key: 'priority', options: ['All Priority', 'low',  'medium',      'high'] },
                    ].map(f => (
                        <div key={f.key} style={{ position: 'relative' }}>
                            <select
                                onChange={e => setFilter({...filter, [f.key]: e.target.value.startsWith('All') ? '' : e.target.value})}
                                style={{
                                    padding: '8px 32px 8px 12px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '8px', color: '#fff',
                                    fontSize: '13px', outline: 'none', cursor: 'pointer',
                                    appearance: 'none',
                                }}
                            >
                                {f.options.map(o => <option key={o} value={o} style={{ background: '#1a1a2e' }}>{o.replace('_', ' ')}</option>)}
                            </select>
                            <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                        </div>
                    ))}
                </div>

                {/* Task List */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                    </div>
                ) : tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <LayoutGrid size={40} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No tasks found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tasks.map(task => (
                            <div key={task.id}
                                onClick={() => router.push(`/tasks/${task.id}`)}
                                style={{
                                    padding: '16px 20px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', gap: '16px',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                                    e.currentTarget.style.transform = 'translateX(3px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                {/* Left */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                        background: statusConfig[task.status]?.color,
                                        boxShadow: `0 0 8px ${statusConfig[task.status]?.color}`,
                                    }} />
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500',
                                        color: statusConfig[task.status]?.color,
                                        background: statusConfig[task.status]?.bg,
                                    }}>
                                        {statusConfig[task.status]?.icon}
                                        {statusConfig[task.status]?.label}
                                    </span>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500',
                                        color: priorityConfig[task.priority]?.color,
                                        background: priorityConfig[task.priority]?.bg,
                                        border: `1px solid ${priorityConfig[task.priority]?.border}`,
                                    }}>
                                        {task.priority}
                                    </span>
                                    {task.due_date && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                                            <Calendar size={11} />
                                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                    <button
                                        onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                                        style={{
                                            padding: '5px', borderRadius: '6px', border: 'none',
                                            background: 'transparent', color: 'rgba(248,113,113,0.45)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,113,113,0.45)'}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Create Task */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
                    }}
                >
                    <div onClick={e => e.stopPropagation()} style={{
                        width: '100%', maxWidth: '460px',
                        background: '#1c1c2e',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '16px', padding: '28px',
                    }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>Create New Task</h2>
                        <form onSubmit={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Title *</label>
                                <input placeholder="Task title" required value={newTask.title}
                                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                                <textarea placeholder="Task description" rows={3} value={newTask.description}
                                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    style={{ ...inputStyle, resize: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { label: 'Priority', key: 'priority', options: ['low', 'medium', 'high'] },
                                    { label: 'Status',   key: 'status',   options: ['todo', 'in_progress', 'done'] },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>{f.label}</label>
                                        <select value={newTask[f.key]}
                                            onChange={e => setNewTask({...newTask, [f.key]: e.target.value})}
                                            style={{ ...inputStyle, cursor: 'pointer' }}>
                                            {f.options.map(o => <option key={o} value={o} style={{ background: '#1c1c2e' }}>{o.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Due Date</label>
                                <input type="date" value={newTask.due_date}
                                    onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                                    style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <button type="button" onClick={() => setOpen(false)} style={{
                                    flex: 1, padding: '11px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
                                    fontSize: '14px', cursor: 'pointer',
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    flex: 1, padding: '11px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none', borderRadius: '10px',
                                    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                                }}>Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
            `}</style>
        </div>
    );
}