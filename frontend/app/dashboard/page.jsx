'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { Loader2, Plus, Trash2, LogOut, CheckSquare } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import echo from '@/lib/echo';

export default function Dashboard() {
    const [tasks, setTasks]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filter, setFilter]     = useState({ status: '', priority: '', search: '' });
    const [open, setOpen]         = useState(false);
    const [user, setUser]         = useState(null);
    const [newTask, setNewTask]   = useState({
        title: '', description: '', priority: 'medium', status: 'todo', due_date: ''
    });
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        setUser(JSON.parse(stored));
        fetchTasks();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [filter]);

    useEffect(() => {
        const channel = echo.channel('tasks');

        channel.listen('.task.updated', (e) => {
            fetchTasks();
        });

        return () => {
            echo.leaveChannel('tasks');
        };
    }, []);

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

    const priorityColor = {
        low:    'bg-green-100 text-green-700 border-green-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        high:   'bg-red-100 text-red-700 border-red-200',
    };

    const statusColor = {
        todo:        'bg-gray-100 text-gray-600 border-gray-200',
        in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
        done:        'bg-green-100 text-green-700 border-green-200',
    };

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" richColors />

            {/* Navbar */}
            <nav className="border-b bg-card px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">TaskFlow</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{user?.name}</span>
                    <Button variant="ghost" size="sm" onClick={logout}>
                        <LogOut className="w-4 h-4 mr-1" /> Logout
                    </Button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
                        <p className="text-sm text-muted-foreground">{tasks.length} tasks total</p>
                    </div>

                    {/* Create Task Dialog */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-1" /> New Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Task</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={createTask} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        placeholder="Task title"
                                        required
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        placeholder="Task description"
                                        value={newTask.description}
                                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Priority</label>
                                        <Select onValueChange={v => setNewTask({...newTask, priority: v})} defaultValue="medium">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select onValueChange={v => setNewTask({...newTask, status: v})} defaultValue="todo">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todo">Todo</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <Input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button type="submit">Create Task</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6 flex-wrap">
                    <Input
                        placeholder="Search tasks..."
                        className="max-w-xs"
                        onChange={e => setFilter({...filter, search: e.target.value})}
                    />
                    <Select onValueChange={v => setFilter({...filter, status: v === 'all' ? '' : v})}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={v => setFilter({...filter, priority: v === 'all' ? '' : v})}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="All Priority" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Task List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No tasks found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <Card key={task.id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="p-4 flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="font-semibold text-foreground">{task.title}</h2>
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[task.status]}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                            {task.due_date && (
                                                <span className="text-xs text-muted-foreground">
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/tasks/${task.id}`)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTask(task.id)}
                                        className="text-destructive hover:text-destructive ml-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}