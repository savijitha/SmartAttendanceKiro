import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './AttendanceHistory.module.css';

const statusColor = { present: '#16a34a', late: '#d97706', absent: '#dc2626' };
const statusIcon = { present: '✅', late: '⏰', absent: '❌' };

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonModal, setReasonModal] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/attendance/student/${user._id}?days=30`),
      api.get('/attendance/my-stats'),
    ]).then(([r1, r2]) => { setRecords(r1.data); setStats(r2.data); })
      .finally(() => setLoading(false));
  }, [user._id]);

  const submitReason = async () => {
    try {
      await api.post('/attendance/absent-reason', { attendanceId: reasonModal._id, reason });
      setRecords(prev => prev.map(r => r._id === reasonModal._id ? { ...r, absentReason: reason } : r));
      setReasonModal(null);
      toast.success('Reason submitted');
    } catch { toast.error('Failed to submit reason'); }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>📊 Attendance History</h2>

      {stats.length > 0 && (
        <div className={styles.statsSection}>
          <h3>Subject-wise Attendance</h3>
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.subject} className={styles.statCard}>
                <div className={styles.statSubject}>{s.subject}</div>
                <div className={styles.statPct} style={{ color: s.percentage >= 75 ? '#16a34a' : '#dc2626' }}>
                  {s.percentage}%
                </div>
                <div className={styles.statBar}>
                  <div className={styles.statFill} style={{ width: `${s.percentage}%`, background: s.percentage >= 75 ? '#16a34a' : '#dc2626' }} />
                </div>
                <div className={styles.statDetail}>{s.present}P · {s.late}L · {s.absent}A / {s.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.historySection}>
        <h3>Last 30 Days</h3>
        {records.length === 0 ? (
          <div className={styles.empty}>No attendance records</div>
        ) : (
          <div className={styles.list}>
            {records.map(r => (
              <div key={r._id} className={styles.record}>
                <span className={styles.recordIcon}>{statusIcon[r.status]}</span>
                <div className={styles.recordInfo}>
                  <div className={styles.recordSubject}>{r.timetableId?.subject}</div>
                  <div className={styles.recordMeta}>
                    {new Date(r.date).toLocaleDateString()} · {r.timetableId?.startTime} · {r.timetableId?.classroom}
                  </div>
                  {r.absentReason && <div className={styles.reason}>Reason: {r.absentReason}</div>}
                </div>
                <div className={styles.recordRight}>
                  <span className={styles.statusBadge} style={{ background: statusColor[r.status] }}>{r.status}</span>
                  {r.status === 'absent' && !r.absentReason && (
                    <button className={styles.reasonBtn} onClick={() => setReasonModal(r)}>Add Reason</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reasonModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Submit Absence Reason</h3>
            <p>{reasonModal.timetableId?.subject} · {new Date(reasonModal.date).toLocaleDateString()}</p>
            <textarea className={styles.textarea} placeholder="Enter your reason..." value={reason}
              onChange={e => setReason(e.target.value)} rows={4} />
            <div className={styles.modalBtns}>
              <button className={styles.btn} onClick={submitReason}>Submit</button>
              <button className={`${styles.btn} ${styles.btnCancel}`} onClick={() => setReasonModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
