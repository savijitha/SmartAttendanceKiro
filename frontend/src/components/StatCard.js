import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({ icon, label, value, color = '#4f46e5', sub }) {
  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ background: color + '20', color }}>{icon}</div>
      <div className={styles.info}>
        <div className={styles.value} style={{ color }}>{value}</div>
        <div className={styles.label}>{label}</div>
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
    </div>
  );
}
