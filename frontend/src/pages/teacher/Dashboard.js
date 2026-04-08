import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import styles from './Dashboard.module.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/teacher').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  const { classStats = [] } = data || {};
  const totalStudents = classStats.reduce((s, c) => s + c.totalStudents, 0);
  const totalPresent = classStats.reduce((s, c) => s + c.present + c.late, 0);

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <div>
          <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Subject: {user?.subject} · ID: {user?.employeeId}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="📚" label="Today's Classes" value={classStats.length} color="#4f46e5" />
        <StatCard icon="👥" label="Total Students" value={totalStudents} color="#0891b2" />
        <StatCard icon="✅" label="Present Today" value={totalPresent} color="#16a34a" />
        <StatCard icon="🔔" label="Notifications" value={data?.unreadNotifications || 0} color="#d97706" />
      </div>

      <div className={styles.section}>
        <h3>Today's Classes</h3>
        {classStats.length === 0 ? (
          <div className={styles.empty}>No classes today</div>
        ) : (
          <div className={styles.classTable}>
            <div className={styles.tableHeader}>
              <span>Subject</span><span>Time</span><span>Class</span><span>Present</span><span>Absent</span><span>Action</span>
            </div>
            {classStats.map(({ class: cls, totalStudents, present, late, absent }) => (
              <div key={cls._id} className={styles.tableRow}>
                <span className={styles.subject}>{cls.subject}</span>
                <span>{cls.startTime} – {cls.endTime}</span>
                <span>{cls.class}{cls.section} · {cls.classroom}</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{present + late}</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{absent}</span>
                <Link to={`/teacher/class/${cls._id}`} className={styles.viewBtn}>View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
