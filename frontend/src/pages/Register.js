import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function Register() {
  const [userType, setUserType] = useState('student');
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (userType === 'teacher') {
        // Teacher has no file upload — send as JSON
        const res = await api.post('/auth/register/teacher', form);
        data = res.data;
      } else {
        // Student may have a photo — send as multipart
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (photo) fd.append('photo', photo);
        const res = await api.post('/auth/register/student', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = res.data;
      }
      localStorage.setItem('token', data.token);
      toast.success('Account created!');
      navigate(userType === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 480 }}>
        <div className={styles.logo}>🎓</div>
        <h1 className={styles.title}>Create Account</h1>

        <div className={styles.tabs}>
          {['student', 'teacher'].map(t => (
            <button key={t} className={`${styles.tab} ${userType === t ? styles.activeTab : ''}`}
              onClick={() => setUserType(t)}>
              {t === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Teacher'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} placeholder="Full Name" required onChange={e => set('name', e.target.value)} />
          <input className={styles.input} type="email" placeholder="Email" required onChange={e => set('email', e.target.value)} />
          <input className={styles.input} placeholder="Phone Number" required onChange={e => set('phone', e.target.value)} />
          <input className={styles.input} type="password" placeholder="Password" required onChange={e => set('password', e.target.value)} />

          {userType === 'student' ? (
            <>
              <input className={styles.input} placeholder="Class (e.g. 10)" required onChange={e => set('class', e.target.value)} />
              <input className={styles.input} placeholder="Section (e.g. A)" onChange={e => set('section', e.target.value)} />
              <input className={styles.input} placeholder="Roll Number" required onChange={e => set('rollNumber', e.target.value)} />
              <input className={styles.input} placeholder="Parent Email (optional)" onChange={e => set('parentEmail', e.target.value)} />
              <input className={styles.input} placeholder="Parent Phone (optional)" onChange={e => set('parentPhone', e.target.value)} />
              <label className={styles.fileLabel}>
                📷 Upload Photo (for face recognition)
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ display: 'none' }} />
              </label>
              {photo && <span className={styles.fileName}>✅ {photo.name}</span>}
            </>
          ) : (
            <>
              <input className={styles.input} placeholder="Subject Specialization" required onChange={e => set('subject', e.target.value)} />
              <input className={styles.input} placeholder="Employee ID" required onChange={e => set('employeeId', e.target.value)} />
            </>
          )}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.link}>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
