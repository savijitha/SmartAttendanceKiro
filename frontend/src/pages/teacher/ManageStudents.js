import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './ManageStudents.module.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchStudents = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filterClass) params.append('class', filterClass);
    api.get(`/students?${params}`).then(r => setStudents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search, filterClass]);

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    await api.delete(`/students/${id}`);
    toast.success('Student deactivated');
    fetchStudents();
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>👥 Manage Students</h2>

      <div className={styles.filters}>
        <input className={styles.search} placeholder="🔍 Search by name..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <input className={styles.classFilter} placeholder="Filter by class" value={filterClass}
          onChange={e => setFilterClass(e.target.value)} />
      </div>

      {loading ? <div className={styles.loading}>Loading...</div> : (
        <div className={styles.grid}>
          {students.map(s => (
            <div key={s._id} className={styles.card} onClick={() => setSelected(s)}>
              <div className={styles.avatar}>
                {s.photo ? <img src={s.photo} alt={s.name} className={styles.photo} /> : s.name[0].toUpperCase()}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{s.name}</div>
                <div className={styles.meta}>Roll: {s.rollNumber} · Class {s.class}{s.section}</div>
                <div className={styles.meta}>{s.email}</div>
                <div className={styles.faceStatus}>
                  {s.faceDescriptor?.length > 0 ? '✅ Face registered' : '⚠️ No face data'}
                </div>
              </div>
              <button className={styles.deactivateBtn} onClick={e => { e.stopPropagation(); deactivate(s._id); }}>
                Deactivate
              </button>
            </div>
          ))}
          {students.length === 0 && <div className={styles.empty}>No students found</div>}
        </div>
      )}

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <div className={styles.modalAvatar}>
              {selected.photo ? <img src={selected.photo} alt={selected.name} className={styles.modalPhoto} /> : selected.name[0]}
            </div>
            <h3>{selected.name}</h3>
            <div className={styles.modalDetails}>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>Phone:</strong> {selected.phone}</div>
              <div><strong>Class:</strong> {selected.class}{selected.section}</div>
              <div><strong>Roll No:</strong> {selected.rollNumber}</div>
              <div><strong>Parent Email:</strong> {selected.parentEmail || '—'}</div>
              <div><strong>Parent Phone:</strong> {selected.parentPhone || '—'}</div>
              <div><strong>Face Data:</strong> {selected.faceDescriptor?.length > 0 ? '✅ Registered' : '❌ Not registered'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
