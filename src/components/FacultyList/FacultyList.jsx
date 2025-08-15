import { PencilIcon, TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import styles from './FacultyList.module.css';

export default function FacultyList({ users, onEdit, onDelete, getRoleBadge, getStatusBadge }) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeader}>
              Kullanıcı
            </th>
            <th className={styles.tableHeader}>
              Rol
            </th>
            <th className={styles.tableHeader}>
              Durum
            </th>
            <th className={styles.tableHeader}>
              Bölüm
            </th>
            <th className={styles.tableHeader}>
              Google
            </th>
            <th className={styles.tableHeader}>
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {users.map((user) => (
            <tr key={user._id} className={styles.tableRow}>
              <td className={styles.tableCell}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    <AcademicCapIcon className={styles.avatarIcon} />
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {user.name}
                    </div>
                    <div className={styles.userEmail}>
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className={styles.tableCell}>
                {getRoleBadge(user.role)}
              </td>
              <td className={styles.tableCell}>
                {getStatusBadge(user.isActive ? 'active' : 'inactive')}
              </td>
              <td className={styles.tableCell}>
                {user.department || '-'}
              </td>
              <td className={styles.tableCell}>
                {user.googleId ? (
                  <span className={`${styles.badge} ${styles.badgeGoogle}`}>
                    ✓ Bağlı
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeGoogleNot}`}>
                    Bağlı Değil
                  </span>
                )}
              </td>
              <td className={styles.tableCell}>
                <div className={styles.actions}>
                  <button
                    onClick={() => onEdit(user)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    <PencilIcon className={styles.actionIcon} />
                  </button>
                  <button
                    onClick={() => onDelete(user._id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    <TrashIcon className={styles.actionIcon} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 