import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import ClassCard from '../../components/ClassCard';
import styles from './Dashboard.module.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  const { todayClasses, todayAttendance, stats } = data || {};

  const getStatus = (classId) => {
    const rec = todayAttendance?.find(a => a.timetableId === classId);
    return rec?.status || null;
  };

  const statusBadge = (status) => {
    if (!status) return null;
    const map = { present: { color: '#16a34a', label: '✅ Present' }, late: { color: '#d97706', label: '⏰ Late' }, absent: { color: '#dc2626', label: '❌ Absent' } };
    const s = map[status];
    return s ? <span style={{ background: s.color, color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span> : null;
  };

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <div>
          <h2>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Class {user?.class}{user?.section} · Roll #{user?.rollNumber}</p>
        </div>
        <Link to="/student/attendance" className={styles.markBtn}>📷 Mark Attendance</Link>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="✅" label="Present (30 days)" value={stats?.present || 0} color="#16a34a" />
        <StatCard icon="⏰" label="Late" value={stats?.late || 0} color="#d97706" />
        <StatCard icon="❌" label="Absent" value={stats?.absent || 0} color="#dc2626" />
        <StatCard icon="📊" label="Attendance %" value={`${stats?.percentage || 0}%`} color="#4f46e5"
          sub={stats?.percentage >= 75 ? '✅ Good standing' : '⚠️ Below 75%'} />
      </div>

      <div className={styles.section}>
        <h3>Today's Classes</h3>
        {todayClasses?.length === 0 ? (
          <div className={styles.empty}>No classes today 🎉</div>
        ) : (
          todayClasses?.map(cls => (
            <ClassCard key={cls._id} cls={cls}>
              {getStatus(cls._id) ? statusBadge(getStatus(cls._id)) : (
                <Link to="/student/attendance" className={styles.attendBtn}>Mark Attendance</Link>
              )}
            </ClassCard>
          ))
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
