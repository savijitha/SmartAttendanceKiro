import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Timetable.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const empty = { subject: '', class: '', section: 'A', dayOfWeek: 'Monday', startTime: '', endTime: '', duration: 60, classroom: '', location: { latitude: 0, longitude: 0 } };

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');

  const fetchTimetable = () => {
    api.get('/timetable/my').then(r => setTimetable(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTimetable(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timetable', { ...form, teacherId: user._id, teacherName: user.name });
      toast.success('Class added to timetable');
      setShowForm(false);
      setForm(empty);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add class');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this class?')) return;
    await api.delete(`/timetable/${id}`);
    toast.success('Class removed');
    fetchTimetable();
  };

  const dayClasses = timetable.filter(c => c.dayOfWeek === activeDay);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>📅 Timetable Management</h2>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Class'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>Add New Class</h3>
          <div className={styles.formGrid}>
            <input className={styles.input} placeholder="Subject" required value={form.subject} onChange={e => set('subject', e.target.value)} />
            <input className={styles.input} placeholder="Class (e.g. 10)" required value={form.class} onChange={e => set('class', e.target.value)} />
            <input className={styles.input} placeholder="Section" value={form.section} onChange={e => set('section', e.target.value)} />
            <select className={styles.input} value={form.dayOfWeek} onChange={e => set('dayOfWeek', e.target.value)}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
            <input className={styles.input} type="time" required value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            <input className={styles.input} type="time" required value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            <input className={styles.input} type="number" placeholder="Duration (min)" value={form.duration} onChange={e => set('duration', e.target.value)} />
            <input className={styles.input} placeholder="Classroom (e.g. Room 204)" required value={form.classroom} onChange={e => set('classroom', e.target.value)} />
            <input className={styles.input} type="number" step="any" placeholder="Latitude (GPS)" value={form.location.latitude || ''} onChange={e => set('location', { ...form.location, latitude: parseFloat(e.target.value) || 0 })} />
            <input className={styles.input} type="number" step="any" placeholder="Longitude (GPS)" value={form.location.longitude || ''} onChange={e => set('location', { ...form.location, longitude: parseFloat(e.target.value) || 0 })} />
          </div>
          <button className={styles.submitBtn} type="submit">Add Class</button>
        </form>
      )}

      <div className={styles.dayTabs}>
        {DAYS.map(d => (
          <button key={d} className={`${styles.dayTab} ${activeDay === d ? styles.active : ''}`} onClick={() => setActiveDay(d)}>
            {d.slice(0, 3)} <span className={styles.count}>{timetable.filter(c => c.dayOfWeek === d).length}</span>
          </button>
        ))}
      </div>

      {loading ? <div className={styles.loading}>Loading...</div> : (
        dayClasses.length === 0 ? <div className={styles.empty}>No classes on {activeDay}</div> : (
          <div className={styles.list}>
            {dayClasses.map(cls => (
              <div key={cls._id} className={styles.classRow}>
                <div className={styles.classInfo}>
                  <strong>{cls.subject}</strong>
                  <span>{cls.startTime} – {cls.endTime} ({cls.duration} min)</span>
                  <span>📍 {cls.classroom} · Class {cls.class}{cls.section}</span>
                </div>
                <button className={styles.deleteBtn} onClick={() => handleDelete(cls._id)}>🗑</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
