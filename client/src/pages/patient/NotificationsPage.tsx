import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import {
  Bell,
  CheckCircle2,
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Shield,
  Building2,
  Check,
} from 'lucide-react';
import { NotificationItem } from '../../types/index.js';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return <ArrowRightLeft className="w-4 h-4 text-indigo-600" />;
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-brand-600" />;
      case 'REPORT':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'REMINDER':
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              CareSync Multispeciality Hospital, Chennai
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            Clinical Notification Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding lab results, doctor reviews, case transfers, queue status, and caregiver alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === 'UNREAD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="py-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No active notifications</p>
            <p className="text-xs mt-1">You are all caught up with your clinical updates.</p>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <Card
              key={n.id}
              hoverable
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border transition-all ${
                !n.isRead ? 'bg-brand-50/25 border-brand-200' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <Badge variant="danger" size="sm">New</Badge>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!n.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(n.id)}
                    icon={<Check className="w-3.5 h-3.5" />}
                  >
                    Mark Read
                  </Button>
                )}

                {n.linkUrl && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => (window.location.href = n.linkUrl!)}
                  >
                    Open
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
