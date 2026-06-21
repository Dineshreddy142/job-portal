import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/notifications/${user.id}`);
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.read);
            await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0052cc]"></div></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500 mt-1">Stay updated with your latest activities and application statuses.</p>
                </div>
                {notifications.filter(n => !n.read).length > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0052cc] rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100"
                    >
                        <CheckCircle2 size={14} />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((n) => (
                    <Card 
                        key={n.id} 
                        className={`p-6 border-slate-100 transition-all hover:shadow-md ${!n.read ? 'bg-blue-50/20 border-l-4 border-l-[#0052cc]' : 'bg-white'}`}
                        hover={false}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                    <Bell size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-sm leading-relaxed ${!n.read ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                        {n.message}
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(n.timestamp).toLocaleString()}</span>
                                        {!n.read && <Badge variant="blue" className="text-[8px] py-0">New</Badge>}
                                    </div>
                                </div>
                            </div>
                            {!n.read && (
                                <button 
                                    onClick={() => markAsRead(n.id)}
                                    className="p-2 text-slate-300 hover:text-[#0052cc] transition-colors"
                                    title="Mark as read"
                                >
                                    <CheckCircle2 size={18} />
                                </button>
                            )}
                        </div>
                    </Card>
                )) : (
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No notifications yet</h3>
                        <p className="text-slate-400 text-sm mt-1">We'll notify you when your application status changes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
