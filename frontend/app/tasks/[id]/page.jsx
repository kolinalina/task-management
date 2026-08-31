'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Toaster, toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import {
    Loader2, ArrowLeft, Trash2, Upload, Zap, LogOut,
    FileText, Image, Video, Download, MessageSquare,
    Clock, AlertCircle, CheckCircle2, Calendar
} from 'lucide-react';
import echo from '@/lib/echo';

export default function TaskDetail() {
    const { id }                              = useParams();
    const router                              = useRouter();
    const [task, setTask]                     = useState(null);
    const [comments, setComments]             = useState([]);
    const [attachments, setAttachments]       = useState([]);
    const [comment, setComment]               = useState('');
    const [loading, setLoading]               = useState(true);
    const [uploading, setUploading]           = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [user, setUser] = useState({ name: 'User' });

    useEffect(() => {
        fetchTask();
        fetchComments();
        fetchAttachments();
    }, [id]);

    useEffect(() => {
        if (!echo) return;

        const channel = echo.channel(`tasks.${id}`);
        channel.listen('.comment.created', () => {
            fetchComments();
        });

        return () => {
            echo.leaveChannel(`tasks.${id}`);
        };
    }, [id]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) {}
        }
    }, []);

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.clear();
        router.push('/login');
    };

    const fetchTask = async () => {
        try {
            const res = await api.get(`/tasks/${id}`);
            setTask(res.data);
        } catch {
            toast.error('Failed to fetch task');
        } {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await api.get(`/tasks/${id}/comments`);
            setComments(res.data);
        } catch {}
    };

    const fetchAttachments = async () => {
        try {
            const res = await api.get(`/tasks/${id}/attachments`);
            setAttachments(res.data);
        } catch {}
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            const res = await api.post(`/tasks/${id}/comments`, { comment });
            toast.success('Comment added!');
            setComment('');
            setComments(prev => {
                const exists = prev.some(c => c.id === res.data.id);
                if (exists) return prev;
                return [...prev, res.data];
            });
        } catch {
            toast.error('Failed to add comment');
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            toast.success('Comment deleted');
            fetchComments();
        } catch {
            toast.error('Failed to delete comment');
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);

        try {
            await api.post(`/tasks/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setUploadProgress(percent);
                },
            });
            toast.success('File uploaded!');
            fetchAttachments();
        } catch {
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [id]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 52428800,
        accept: {
            'image/*': [],
            'video/*': [],
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
        }
    });

    const deleteAttachment = async (attachmentId) => {
        if (!confirm('Delete this attachment?')) return;
        try {
            await api.delete(`/attachments/${attachmentId}`);
            toast.success('Attachment deleted');
            fetchAttachments();
        } catch {
            toast.error('Failed to delete attachment');
        }
    };

    const handleViewAttachment = async (att) => {
        try {
            // Fetch the file as a binary blob using your authed api instance
            const response = await api.get(`/attachments/${att.id}/download`, {
                responseType: 'blob'
            });

            // Create a temporary object URL for the browser blob file
            const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: att.mime_type }));
            
            // Open the file in a new tab
            const newTab = window.open(blobUrl, '_blank');
            if (newTab) newTab.focus();

        } catch (error) {
            console.error(error);
            toast.error('Could not authenticate or load the file file.');
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return <Image size={16} />;
        if (mimeType?.startsWith('video/')) return <Video size={16} />;
        return <FileText size={16} />;
    };

    const formatSize = (bytes) => {
        if (bytes < 1024)       return bytes + ' B';
        if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
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

    // Shared UI panel styles
    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#13131f', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#13131f', fontFamily: 'Inter, sans-serif', color: '#fff', pb: '40px' }}>
            <Toaster position="top-right" richColors theme="dark" />

            {/* Glowing background meshes */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse 70% 40% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 30% at 90% 80%, rgba(139,92,246,0.08) 0%, transparent 50%)
                `,
            }} />

            {/* Navigation Header */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100, background: 'rgba(19,19,31,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
                padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px',
            }}>
                <button 
                    onClick={() => router.push('/dashboard')} 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
                    className="back-btn"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                {/* Right Side Minimalist User Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Simple Avatar Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '11px', fontWeight: '700', color: '#fff' 
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{user?.name}</span>
                    </div>

                    {/* Vertical Divider */}
                    <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />

                    {/* Direct Logout Action Text */}
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', cursor: 'pointer' }}>
                        <LogOut size={13} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 10 }}>
                
                {/* 1. Main Task Details Panel */}
                <div style={cardStyle}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.2' }}>
                        {task?.title}
                    </h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                        {task?.description || "No description provided for this task."}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                        {task?.status && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: statusConfig[task.status]?.color, background: statusConfig[task.status]?.bg }}>
                                {statusConfig[task.status]?.icon}
                                {statusConfig[task.status]?.label}
                            </span>
                        )}
                        {task?.priority && (
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: priorityConfig[task.priority]?.color, background: priorityConfig[task.priority]?.bg, border: `1px solid ${priorityConfig[task.priority]?.border}` }}>
                                {task.priority} Priority
                            </span>
                        )}
                        {task?.due_date && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }}>
                                <Calendar size={13} />
                                Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. File Attachments Component Dropzone Container */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={16} style={{ color: '#818cf8' }} /> Task Attachments
                    </h3>

                    {/* Integrated Dropzone Box */}
                    <div
                        {...getRootProps()}
                        style={{
                            border: isDragActive ? '2px dashed #6366f1' : '2px dashed rgba(255,255,255,0.1)',
                            background: isDragActive ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.01)',
                            borderRadius: '12px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                        className="dropzone-box"
                    >
                        <input {...getInputProps()} />
                        <Upload size={24} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
                        {isDragActive ? (
                            <p style={{ fontSize: '13px', color: '#a5b4fc', margin: 0 }}>Drop file to begin upload immediately...</p>
                        ) : (
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', margin: '0 0 2px 0' }}>Drag & drop file here</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>or click to browse local files (max 50MB)</p>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Live Upload Tracking Strip */}
                    {uploading && (
                        <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: 'rgba(255,255,255,0.5)' }}>
                                <span>Uploading file track...</span>
                                <span style={{ fontWeight: '600', color: '#a5b4fc' }}>{uploadProgress}%</span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', height: '4px', overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.1s ease' }} />
                            </div>
                        </div>
                    )}

                    {/* Files Storage Matrix Output */}
                    {attachments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                            {attachments.map(att => (
                                <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                                    
                                    {/* Clickable Wrapper Triggering Secure Handler */}
                                    <div 
                                        onClick={() => handleViewAttachment(att)}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px', 
                                            flex: 1, 
                                            cursor: 'pointer'
                                        }}
                                        className="attachment-link-wrapper"
                                    >
                                        <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                                            {getFileIcon(att.mime_type)}
                                        </span>
                                        <div>
                                            <p style={{ 
                                                fontSize: '13px', 
                                                fontWeight: '500', 
                                                margin: 0, 
                                                color: 'rgba(255,255,255,0.9)',
                                                transition: 'color 0.2s ease'
                                            }} className="file-title-text">
                                                {att.original_name ?? att.file_name}
                                            </p>
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                                                {formatSize(att.file_size)} &middot; v{att.version} &middot; <span style={{ 
                                                    color: att.virus_scan_status === 'clean' 
                                                        ? '#4ade80' 
                                                        : att.virus_scan_status === 'pending' 
                                                            ? '#fbbf24' 
                                                            : '#f87171' 
                                                }}>{att.virus_scan_status}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '4px', position: 'relative', zIndex: 20 }}>
                                        <button onClick={() => handleViewAttachment(att)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} className="action-icon-btn"><Download size={14} /></button>
                                        <button onClick={() => deleteAttachment(att.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(248,113,113,0.4)', cursor: 'pointer' }} className="delete-btn"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                </div>

                {/* 3. Streamlined Feedback Discussions Panel (Comments) */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={16} style={{ color: '#818cf8' }} /> Comments ({comments.length})
                    </h3>

                    {/* Feedback Insertion Submodule */}
                    <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <textarea
                            placeholder="Type a team feedback update..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={3}
                            style={{ ...inputStyle, resize: 'none', lineHeight: '1.5' }}
                        />
                        <button 
                            type="submit" 
                            disabled={!comment.trim()} 
                            style={{ 
                                alignSelf: 'flex-end', padding: '8px 16px', borderRadius: '8px', 
                                background: comment.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)', 
                                border: 'none', color: comment.trim() ? '#fff' : 'rgba(255,255,255,0.2)', 
                                fontSize: '13px', fontWeight: '600', cursor: comment.trim() ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s ease', boxShadow: comment.trim() ? '0 4px 12px rgba(99,102,241,0.2)' : 'none'
                            }}
                        >
                            Post Comment
                        </button>
                    </form>

                    {/* Linear Interactive Conversation Thread Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {comments.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '24px 0' }}>No conversational data links recorded here yet.</p>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} style={{ display: 'flex', gap: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#a5b4fc', shrink: 0 }}>
                                        {c.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>{c.user?.name}</span>
                                            <button onClick={() => deleteComment(c.id)} style={{ marginLeft: 'auto', padding: '2px', background: 'transparent', border: 'none', color: 'rgba(248,113,113,0.4)', cursor: 'pointer' }} className="delete-btn"><Trash2 size={12} /></button>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: '4px 0 6px 0', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{c.comment}</p>
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{new Date(c.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                textarea::placeholder { color: rgba(255,255,255,0.25); }
                
                textarea:focus {
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    background: rgba(255, 255, 255, 0.06) !important;
                    box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
                }
                .back-btn:hover { color: #fff !important; }
                .dropzone-box:hover {
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    background: rgba(255,255,255,0.03) !important;
                }
                .action-icon-btn:hover { color: #fff !important; background: rgba(255,255,255,0.05) !important; }
                .delete-btn:hover { color: #f87171 !important; background: rgba(239,68,68,0.05) !important; }        
                .attachment-link-wrapper:hover .file-title-text {
                    color: #818cf8 !important; /* Highlights title to indigo on hover */
                }
                .attachment-link-wrapper:hover {
                    opacity: 0.85;
                }
                .direct-logout-btn:hover {
                    color: #f87171 !important;
                }
            `}</style>
        </div>
    );
}