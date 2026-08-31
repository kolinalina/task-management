'use client';
import { useEffect, useState, useRef } from 'react';
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

    // Custom filtering dropdown panel states
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

    // Custom modal form dropdown states
    const [formStatusOpen, setFormStatusOpen] = useState(false);
    const [formPriorityOpen, setFormPriorityOpen] = useState(false);

    // Click outside handler refs
    const statusRef = useRef(null);
    const priorityRef = useRef(null);
    const formStatusRef = useRef(null);
    const formPriorityRef = useRef(null);

    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        setUser(JSON.parse(stored));
        fetchTasks();

        // Single centralized click-listener managing all customized popups
        function handleClickOutside(event) {
            if (statusRef.current && !statusRef.current.contains(event.target)) setStatusMenuOpen(false);
            if (priorityRef.current && !priorityRef.current.contains(event.target)) setPriorityMenuOpen(false);
            if (formStatusRef.current && !formStatusRef.current.contains(event.target)) setFormStatusOpen(false);
            if (formPriorityRef.current && !formPriorityRef.current.contains(event.target)) setFormPriorityOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { fetchTasks(); }, [filter]);

    const fetchTasks = async () => {
        try {
            const params = {};
            if (filter.status)   params.status   = filter.status;
            if (filter.priority) params.priority  = filter.priority;
            if (filter.search)   params.search    = filter.search;
            const res = await api.get('/tasks', { params });
            setTasks(res.data.data || res.data);
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

    const handleDragStart = (e, taskId) => { e.dataTransfer.setData('text/plain', taskId.toString()); };
    const handleDragOver  = (e) => { e.preventDefault(); };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const movingTask = tasks.find(t => t.id.toString() === taskId);

        if (!movingTask || movingTask.status === targetStatus) return;

        const originalTasks = [...tasks];
        setTasks(prev => prev.map(task => 
            task.id.toString() === taskId ? { ...task, status: targetStatus } : task
        ));

        try {
            await api.patch(`/tasks/${taskId}`, { status: targetStatus });
            toast.success(`Moved to ${statusConfig[targetStatus].label}`);
        } catch (error) {
            console.error("Laravel Update Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Server rejected status update');
            setTasks(originalTasks);
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

    const kanbanColumns = ['todo', 'in_progress', 'done'];

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    };

    const filterBtnStyle = (isActive) => ({
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', 
        borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
        border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        color: isActive ? '#a5b4fc' : '#e2e8f0', transition: 'all 0.2s ease'
    });

    const menuStyle = {
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%',
        background: '#1c1c2e', border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px', padding: '6px', zIndex: 110, boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)', boxSizing: 'border-box'
    };

    const menuItemStyle = (isSelected) => ({
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', 
        borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
        color: isSelected ? '#a5b4fc' : '#94a3b8',
        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    });

    return (
        <div style={{ minHeight: '100vh', background: '#13131f', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
            <Toaster position="top-right" richColors theme="dark" />

            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse 80% 50% at 10% 10%, rgba(99,102,241,0.15) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 40% at 90% 90%, rgba(139,92,246,0.12) 0%, transparent 60%)
                `,
            }} />

            {/* Global Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50, background: 'rgba(19,19,31,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)',
                padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={15} color="white" />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px' }}>TaskFlow</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{user?.name}</span>
                    </div>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', cursor: 'pointer' }}>
                        <LogOut size={13} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>Project Kanban Board</h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                        <Plus size={16} /> New Task
                    </button>
                </div>

                {/* Metrics Stats Banner */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Tasks',  value: stats.total,       icon: <LayoutGrid size={16} />,   color: '#818cf8' },
                        { label: 'Todo',         value: stats.todo,        icon: <Clock size={16} />,         color: '#94a3b8' },
                        { label: 'In Progress',  value: stats.in_progress, icon: <AlertCircle size={16} />,  color: '#818cf8' },
                        { label: 'Completed',    value: stats.done,        icon: <CheckCircle2 size={16} />, color: '#4ade80' },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>{s.label}</span>
                                <span style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: '800' }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Dashboard Filter Panel */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 40 }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input placeholder="Search tasks..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} style={{ ...inputStyle, paddingLeft: '38px' }} />
                    </div>

                    <div style={{ position: 'relative' }} ref={statusRef}>
                        <button type="button" onClick={() => { setStatusMenuOpen(!statusMenuOpen); setPriorityMenuOpen(false); }} style={filterBtnStyle(!!filter.status)}>
                            <LayoutGrid size={15} />
                            <span>{filter.status ? statusConfig[filter.status].label : 'All Statuses'}</span>
                            <ChevronDown size={14} style={{ transform: statusMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        {statusMenuOpen && (
                            <div style={{ ...menuStyle, minWidth: '190px' }}>
                                <div onClick={() => { setFilter({ ...filter, status: '' }); setStatusMenuOpen(false); }} style={menuItemStyle(!filter.status)} className="menu-item">
                                    <span>All Statuses</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>{tasks.length}</span>
                                </div>
                                {Object.keys(statusConfig).map(key => (
                                    <div key={key} onClick={() => { setFilter({ ...filter, status: key }); setStatusMenuOpen(false); }} style={menuItemStyle(filter.status === key)} className="menu-item">
                                        <span style={{ color: statusConfig[key].color }}>{statusConfig[key].icon}</span>
                                        <span style={{ marginLeft: '6px' }}>{statusConfig[key].label}</span>
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>{tasks.filter(t => t.status === key).length}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative' }} ref={priorityRef}>
                        <button type="button" onClick={() => { setPriorityMenuOpen(!priorityMenuOpen); setStatusMenuOpen(false); }} style={filterBtnStyle(!!filter.priority)}>
                            <Zap size={15} />
                            <span style={{ textTransform: 'capitalize' }}>{filter.priority ? filter.priority : 'All Priorities'}</span>
                            <ChevronDown size={14} style={{ transform: priorityMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        {priorityMenuOpen && (
                            <div style={{ ...menuStyle, minWidth: '190px' }}>
                                <div onClick={() => { setFilter({ ...filter, priority: '' }); setPriorityMenuOpen(false); }} style={menuItemStyle(!filter.priority)} className="menu-item">
                                    <span>All Priorities</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>{tasks.length}</span>
                                </div>
                                {Object.keys(priorityConfig).map(key => (
                                    <div key={key} onClick={() => { setFilter({ ...filter, priority: key }); setPriorityMenuOpen(false); }} style={menuItemStyle(filter.priority === key)} className="menu-item">
                                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: priorityConfig[key].color }} />
                                        <span style={{ textTransform: 'capitalize' }}>{key}</span>
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>{tasks.filter(t => t.priority === key).length}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Kanban Grid Columns */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                    </div>
                ) : (
                    <div
                        style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '20px',
                                alignItems: 'stretch'
                            }}
                    >
                        {kanbanColumns.map(colKey => {
                            const columnTasks = tasks.filter(t => t.status === colKey);
                            const currentConfig = statusConfig[colKey];
                            return (
                                <div
                                    key={colKey}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, colKey)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        height: '700px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: currentConfig?.color, display: 'flex' }}>{currentConfig?.icon}</span>
                                            <h3 style={{ fontSize: '14px', fontWeight: '700' }}>{currentConfig?.label}</h3>
                                        </div>
                                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '20px', color: 'rgba(255,255,255,0.6)' }}>{columnTasks.length}</span>
                                    </div>
                                    <div
                                        className="kanban-scroll"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            flex: 1,
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            paddingRight: '4px'
                                        }}
                                    >
                                        {columnTasks.map(task => (
                                            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} onClick={() => router.push(`/tasks/${task.id}`)} className="task-card" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'grab', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{task.title}</h4>
                                                    {task.description && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>{task.description}</p>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', flexWrap: 'wrap', gap: '6px' }}>
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: priorityConfig[task.priority]?.color, background: priorityConfig[task.priority]?.bg, border: `1px solid ${priorityConfig[task.priority]?.border}` }}>{task.priority}</span>
                                                        {task.due_date && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                                                <Calendar size={11} />
                                                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }} style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(248,113,113,0.4)', cursor: 'pointer' }} className="delete-btn"><Trash2 size={13} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {columnTasks.length === 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '32px 16px', color: 'rgba(255,255,255,0.25)', fontSize: '12px', flex: 1 }}>Drop tasks here</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- UPGRADED CREATION MODAL FORM --- */}
            {open && (
                <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '460px', background: '#1c1c2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '28px', position: 'relative' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Create New Task</h2>
                        
                        <form onSubmit={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Title *</label>
                                <input placeholder="Task title" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={inputStyle} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                                <textarea placeholder="Task description" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{ ...inputStyle, resize: 'none' }} />
                            </div>

                            {/* Dual Customized Menu Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                
                                {/* Form Status Dropdown Field */}
                                <div style={{ position: 'relative' }} ref={formStatusRef}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Status</label>
                                    <button type="button" onClick={() => { setFormStatusOpen(!formStatusOpen); setFormPriorityOpen(false); }} style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: statusConfig[newTask.status].color, display: 'flex' }}>{statusConfig[newTask.status].icon}</span>
                                            {statusConfig[newTask.status].label}
                                        </span>
                                        <ChevronDown size={14} style={{ transform: formStatusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                                    </button>
                                    
                                    {formStatusOpen && (
                                        <div style={menuStyle}>
                                            {Object.keys(statusConfig).map(key => (
                                                <div key={key} onClick={() => { setNewTask({...newTask, status: key}); setFormStatusOpen(false); }} style={menuItemStyle(newTask.status === key)} className="menu-item">
                                                    <span style={{ color: statusConfig[key].color }}>{statusConfig[key].icon}</span>
                                                    <span>{statusConfig[key].label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Form Priority Dropdown Field */}
                                <div style={{ position: 'relative' }} ref={formPriorityRef}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>Priority</label>
                                    <button type="button" onClick={() => { setFormPriorityOpen(!formPriorityOpen); setFormStatusOpen(false); }} style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: priorityConfig[newTask.priority].color }} />
                                            <span style={{ textTransform: 'capitalize' }}>{newTask.priority}</span>
                                        </span>
                                        <ChevronDown size={14} style={{ transform: formPriorityOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                                    </button>
                                    
                                    {formPriorityOpen && (
                                        <div style={menuStyle}>
                                            {Object.keys(priorityConfig).map(key => (
                                                <div key={key} onClick={() => { setNewTask({...newTask, priority: key}); setFormPriorityOpen(false); }} style={menuItemStyle(newTask.priority === key)} className="menu-item">
                                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: priorityConfig[key].color }} />
                                                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '500' }}>
                                    Due Date
                                </label>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <Calendar size={16} style={{ 
                                        position: 'absolute', 
                                        left: '14px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        color: 'rgba(255,255,255,0.3)',
                                        pointerEvents: 'none',
                                        zIndex: 10
                                    }} />
                                    
                                    <input 
                                        type="date" 
                                        value={newTask.due_date} 
                                        onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                                        min={new Date().toISOString().split('T')[0]} /* <--- THIS PREVENTS PAST DATES SELECTION */
                                        style={{ 
                                            width: '100%', 
                                            padding: '11px 14px 11px 40px', 
                                            background: 'rgba(255,255,255,0.04)', 
                                            border: '1px solid rgba(255,255,255,0.08)', 
                                            borderRadius: '10px', 
                                            color: '#fff', 
                                            fontSize: '14px', 
                                            outline: 'none', 
                                            boxSizing: 'border-box' 
                                        }} 
                                        className="custom-date-input"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
                
                .menu-item:hover {
                    background: rgba(255,255,255,0.05) !important;
                    color: #fff !important;
                }
                .task-card:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                }
                .task-card:active { cursor: grabbing !important; opacity: 0.5; }
                .delete-btn:hover { color: #f87171 !important; }

                /* Advanced styling for the date input field and its browser popup */
                .custom-date-input {
                    color-scheme: dark; /* Fixes the bright white calendar dropdown! */
                }

                .custom-date-input::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }

                .custom-date-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }

                .custom-date-input:focus {
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    background: rgba(255, 255, 255, 0.06) !important;
                    box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
                }

                .custom-date-input:invalid {
                    border-color: rgba(239, 68, 68, 0.4) !important;
                    background: rgba(239, 68, 68, 0.05) !important;
                }

                .column-container {
                    height: calc(100vh - 100px); 
                    overflow-y: auto; 
                    overflow-x: hidden; 
                }
                .kanban-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .kanban-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .kanban-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2);
                    border-radius: 10px;
                }

                .kanban-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.4);
                }
            `}</style>
        </div>
    );
}