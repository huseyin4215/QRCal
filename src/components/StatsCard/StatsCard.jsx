import styles from './StatsCard.module.css';

export default function StatsCard({ title, value, icon, color = 'blue' }) {
  return (
    <div className={`${styles.statsCard} ${styles[color]}`}>
      <div className={styles.iconContainer}>
        <div className={styles.icon}>{icon}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
}