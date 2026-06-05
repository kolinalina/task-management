'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import {
    Loader2, ArrowLeft, Trash2, Upload,
    FileText, Image, Video, Download, MessageSquare
} from 'lucide-react';
import echo from '@/lib/echo';

export default function TaskDetail() {
    const { id }                          = useParams();
    const router                          = useRouter();
    const [task, setTask]                 = useState(null);
    const [comments, setComments]         = useState([]);
    const [attachments, setAttachments]   = useState([]);
    const [comment, setComment]           = useState('');
    const [loading, setLoading]           = useState(true);
    const [uploading, setUploading]       = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchTask();
        fetchComments();
        fetchAttachments();
    }, [id]);

    useEffect(() => {
        if (!echo) return;

        const channel = echo.channel(`tasks.${id}`);

        channel.listen('.comment.created', (e) => {
            // console.log('comment received:', e.comment);
            setComments(prev => {
                // Cek apakah comment sudah ada
                const exists = prev.some(c => c.id === e.comment.id);
                if (exists) return prev;
                return [...prev, e.comment];
            });
        });

        channel.subscribed(() => {
            // console.log('subscribed to channel tasks.' + id);
        });

        return () => {
            echo.leaveChannel(`tasks.${id}`);
        };
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await api.get(`/tasks/${id}`);
            setTask(res.data);
        } catch {
            toast.error('Failed to fetch task');
        } finally {
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
            'image/*':       [],
            'video/*':       [],
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
        }
    });

    const deleteAttachment = async (attachmentId) => {
        try {
            await api.delete(`/attachments/${attachmentId}`);
            toast.success('Attachment deleted');
            fetchAttachments();
        } catch {
            toast.error('Failed to delete attachment');
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return <Image className="w-4 h-4" />;
        if (mimeType?.startsWith('video/')) return <Video className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const formatSize = (bytes) => {
        if (bytes < 1024)       return bytes + ' B';
        if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const statusColor = {
        todo:        'bg-gray-100 text-gray-600',
        in_progress: 'bg-blue-100 text-blue-700',
        done:        'bg-green-100 text-green-700',
    };

    const priorityColor = {
        low:    'bg-green-100 text-green-700',
        medium: 'bg-yellow-100 text-yellow-700',
        high:   'bg-red-100 text-red-700',
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" richColors />

            {/* Navbar */}
            <nav className="border-b bg-card px-6 py-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>
            </nav>

            <div className="max-w-4xl mx-auto p-6 space-y-6">

                {/* Task Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{task?.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground">{task?.description}</p>
                        <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColor[task?.status]}`}>
                                {task?.status?.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[task?.priority]}`}>
                                {task?.priority}
                            </span>
                            {task?.due_date && (
                                <span className="text-xs text-muted-foreground px-2 py-1">
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Attachments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                ${isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            {isDragActive ? (
                                <p className="text-sm text-primary">Drop file here...</p>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium">Drag & drop file here</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        or click to select — Images, PDF, Word, Video (max 50MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Attachment List */}
                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">{getFileIcon(att.mime_type)}</span>
                                            <div>
                                                <p className="text-sm font-medium">{att.original_name ?? att.file_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatSize(att.file_size)} · v{att.version} · {att.virus_scan_status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost" size="sm"
                                                onClick={() => window.open(`http://localhost:8000/api/attachments/${att.id}/download`)}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => deleteAttachment(att.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Comments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Comment Form */}
                        <form onSubmit={submitComment} className="space-y-2">
                            <Textarea
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={3}
                            />
                            <Button type="submit" size="sm" disabled={!comment.trim()}>
                                Post Comment
                            </Button>
                        </form>

                        {/* Comment List */}
                        <div className="space-y-3">
                            {comments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                                            {c.user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium">{c.user?.name}</p>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                                    onClick={() => deleteComment(c.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">{c.comment}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(c.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}