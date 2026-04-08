import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import styles from './Notifications.module.css';

const typeIcon = {
  class_reminder: '📚', attendance_reminder: '⏰', late_warning: '⚠️',
  attendance_confirmed: '✅', absent_alert: '❌', teacher_alert: '🔍',
  daily_summary: '📊', weekly_report: '📈', otp_generated: '🔑',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>🔔 Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <button className={styles.markAllBtn} onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>No notifications yet</div>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div key={n._id} className={`${styles.item} ${!n.isRead ? styles.unread : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}>
              <span className={styles.icon}>{typeIcon[n.type] || '🔔'}</span>
              <div className={styles.content}>
                <div className={styles.title}>{n.title}</div>
                <div className={styles.message}>{n.message}</div>
                <div className={styles.time}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
