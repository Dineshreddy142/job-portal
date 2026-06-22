import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { mailApi } from '../services/mailApi';
import {
    Mail, Briefcase, Inbox, Circle, Clock,
    RefreshCw, Wifi, WifiOff, AlertCircle, ExternalLink
} from 'lucide-react';
import Badge from '../components/common/Badge';

const POLL_INTERVAL_MS = 30000; // 30 seconds

const MailInbox = () => {
    const { user } = useContext(AuthContext);
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('gmail'); // 'gmail' or 'all'
    const [selectedMail, setSelectedMail] = useState(null);
    const [gmailLinked, setGmailLinked] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const pollRef = useRef(null);

    const fetchMails = useCallback(async (silent = false) => {
        if (!user?.id) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);

        try {
            let data = [];
            if (filter === 'gmail') {
                data = await mailApi.getGmailMails(user.id);
                setGmailLinked(true);
                setIsLive(true);
            } else {
                data = await mailApi.getMails(user.id, filter);
                setIsLive(false);
            }
            setMails(data);
            setLastUpdated(new Date());
            if (data.length > 0 && !selectedMail) {
                setSelectedMail(data[0]);
            }
        } catch (err) {
            if (err.response?.data?.error === 'GMAIL_NOT_LINKED' || err.message?.includes('GMAIL_NOT_LINKED')) {
                setGmailLinked(false);
                setIsLive(false);
            } else {
                setError('Failed to fetch emails. Please try again.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, filter, selectedMail]);

    // Initial fetch + polling for Gmail
    useEffect(() => {
        fetchMails();

        if (filter === 'gmail') {
            pollRef.current = setInterval(() => fetchMails(true), POLL_INTERVAL_MS);
        }
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [user, filter]);

    const handleManualRefresh = () => fetchMails(true);

    const handleSelectMail = async (mail) => {
        setSelectedMail(mail);
        if (!mail.read && mail.id) {
            try {
                await mailApi.markAsRead(mail.id);
                setMails(mails.map(m => m.id === mail.id ? { ...m, read: true } : m));
            } catch (e) { /* ignore */ }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getSenderInitial = (sender) => {
        const name = sender?.split('<')[0].trim() || sender || '?';
        return name.charAt(0).toUpperCase();
    };

    const getSenderName = (sender) => {
        const match = sender?.match(/^(.+?)\s*</);
        if (match) return match[1].trim();
        return sender || 'Unknown';
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Inner Sidebar */}
            <div className="w-56 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex flex-col">
                <div className="mb-6 px-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="text-blue-600" size={22} />
                        Mail Inbox
                    </h2>
                </div>
                
                <nav className="flex-1 space-y-1">
                    <button
                        onClick={() => setFilter('gmail')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                            filter === 'gmail'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        {/* Google "G" icon */}
                        <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
                            <path fill={filter === 'gmail' ? 'white' : '#FFC107'} d="M43.6 20H24v8h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                            <path fill={filter === 'gmail' ? 'white' : '#FF3D00'} d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                        </svg>
                        <span className="font-medium">My Gmail</span>
                        {isLive && (
                            <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" title="Live" />
                        )}
                    </button>
                    
                    <button
                        onClick={() => setFilter('all')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                            filter === 'all'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Inbox size={16} />
                        <span className="font-medium">All Mails</span>
                    </button>
                    
                    <button
                        onClick={() => setFilter('job-related')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                            filter === 'job-related'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Briefcase size={16} />
                        <span className="font-medium">Job Related</span>
                    </button>
                </nav>
                
                {/* Status Footer */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {filter === 'gmail' && gmailLinked && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Wifi size={12} className="text-emerald-500" />
                            <span>Auto-refresh every 30s</span>
                        </div>
                    )}
                    {lastUpdated && (
                        <p className="text-xs text-slate-400 mt-1">
                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            </div>

            {/* Mail List */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                        {filter === 'gmail' ? '📬 Your Gmail' : filter === 'job-related' ? '💼 Job Related' : '📥 Inbox'}
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant="blue">{mails.length}</Badge>
                        <button
                            onClick={handleManualRefresh}
                            disabled={refreshing}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                            title="Refresh now"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {/* Gmail Not Linked Banner */}
                    {filter === 'gmail' && !gmailLinked && !loading && (
                        <div className="m-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Gmail Not Connected</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                        Sign out and sign back in with Google to grant Gmail access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="m-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400">
                            ⚠️ {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-8 gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            <p className="text-xs text-slate-400">Fetching emails from Gmail...</p>
                        </div>
                    ) : mails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                            <Mail size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No emails found</p>
                            <p className="text-xs mt-1 opacity-70">
                                {filter === 'gmail' ? 'No job-related emails in your Gmail.' : 'Your inbox is empty.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {mails.map((mail, idx) => (
                                <div
                                    key={mail.id || idx}
                                    onClick={() => handleSelectMail(mail)}
                                    className={`p-4 cursor-pointer transition-colors ${
                                        selectedMail === mail || selectedMail?.id === mail.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                                            : !mail.read
                                                ? 'bg-white dark:bg-slate-900 border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                : 'bg-slate-50/50 dark:bg-slate-900/50 border-l-4 border-transparent opacity-80 hover:opacity-100'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {getSenderInitial(mail.sender)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-sm truncate pr-2 ${!mail.read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {getSenderName(mail.sender)}
                                                </span>
                                                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                                                    {formatDate(mail.receivedAt)}
                                                </span>
                                            </div>
                                            <h4 className={`text-xs truncate mt-0.5 ${!mail.read ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-500 dark:text-slate-500'}`}>
                                                {mail.subject}
                                            </h4>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-1">
                                                {mail.body}
                                            </p>
                                            <div className="mt-1.5 flex gap-1.5">
                                                {mail.jobRelated && (
                                                    <Badge variant="green" className="text-[10px] py-0 px-1.5 flex gap-1 items-center">
                                                        <Briefcase size={8} /> Job
                                                    </Badge>
                                                )}
                                                {!mail.read && (
                                                    <Badge variant="blue" className="text-[10px] py-0 px-1.5 flex gap-1 items-center">
                                                        <Circle size={6} fill="currentColor" /> New
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mail View Pane */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                {selectedMail ? (
                    <>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight pr-4">
                                    {selectedMail.subject}
                                </h2>
                                <div className="flex gap-2 flex-shrink-0">
                                    {selectedMail.jobRelated && (
                                        <Badge variant="green" className="flex items-center gap-1">
                                            <Briefcase size={12} /> Job Related
                                        </Badge>
                                    )}
                                    {filter === 'gmail' && (
                                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Wifi size={12} />
                                            <span>Live Gmail</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {getSenderInitial(selectedMail.sender)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {getSenderName(selectedMail.sender)}
                                        </p>
                                        <p className="text-xs text-slate-500 font-mono">{selectedMail.sender}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                    <Clock size={14} />
                                    {selectedMail.receivedAt ? new Date(selectedMail.receivedAt).toLocaleString() : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8 flex-1 overflow-y-auto">
                            <div className="max-w-3xl">
                                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                    {selectedMail.body || <span className="italic text-slate-400">No preview available. Open in Gmail to read.</span>}
                                </div>
                                
                                {/* Gmail link note */}
                                {filter === 'gmail' && (
                                    <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                                        <ExternalLink size={12} />
                                        This is a snippet preview. Open Gmail for the full email.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
                        <Mail size={64} className="mb-6 opacity-20" />
                        <h3 className="text-xl font-medium text-slate-500 dark:text-slate-400">Select an email to read</h3>
                        <p className="text-sm mt-2 text-slate-400">Click on an email from the list to view its contents.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailInbox;
