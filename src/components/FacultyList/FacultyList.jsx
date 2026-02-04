import { PencilIcon, TrashIcon, UserIcon, CheckBadgeIcon, XCircleIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatUserName } from '../../utils/formatUserName';
import styles from './FacultyList.module.css';

export default function FacultyList({ users, onEdit, onDelete, onViewStudent, onViewAppointmentHistory, getRoleBadge, getStatusBadge }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return styles.avatarAdmin;
      case 'faculty':
        return styles.avatarFaculty;
      case 'student':
        return styles.avatarStudent;
      default:
        return styles.avatarDefault;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Kullanıcı</th>
              <th className={styles.tableHeader}>Rol</th>
              <th className={styles.tableHeader}>Durum</th>
              <th className={styles.tableHeader}>Bölüm</th>
              <th className={styles.tableHeader}>Google</th>
              <th className={styles.tableHeader}>İşlemler</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {users.map((user) => (
              <tr key={user._id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <div className={styles.userInfo}>
                    <div className={`${styles.avatar} ${getRoleColor(user.role)}`}>
                      <span className={styles.avatarText}>
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>{formatUserName(user)}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  {getRoleBadge(user.role)}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.statusContainer}>
                    {user.isActive ? (
                      <div className={`${styles.statusBadge} ${styles.statusActive}`}>
                        <CheckBadgeIcon className={styles.statusIcon} />
                        <span>Aktif</span>
                      </div>
                    ) : (
                      <div className={`${styles.statusBadge} ${styles.statusInactive}`}>
                        <XCircleIcon className={styles.statusIcon} />
                        <span>Pasif</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.departmentText}>
                    {user.department || 'Belirtilmemiş'}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.googleStatus}>
                    {user.googleId ? (
                      <div className={`${styles.googleBadge} ${styles.googleConnected}`}>
                        <CheckBadgeIcon className={styles.googleIcon} />
                        <span>Bağlı</span>
                      </div>
                    ) : (
                      <div className={`${styles.googleBadge} ${styles.googleNotConnected}`}>
                        <XCircleIcon className={styles.googleIcon} />
                        <span>Bağlı Değil</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => onViewAppointmentHistory && onViewAppointmentHistory(user)}
                      className={`${styles.actionButton} ${styles.historyButton}`}
                      title="Randevu Geçmişi"
                    >
                      <ClockIcon className={styles.actionIcon} />
                    </button>
                    {user.role === 'student' ? (
                      // Öğrenciler için bilgi butonu ve delete butonu
                      <>
                        <button
                          onClick={() => onViewStudent && onViewStudent(user)}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          title="Bilgileri Görüntüle"
                        >
                          <EyeIcon className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(user._id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Sil"
                        >
                          <TrashIcon className={styles.actionIcon} />
                        </button>
                      </>
                    ) : (
                      // Öğretim üyeleri için edit ve delete butonları
                      <>
                        <button
                          onClick={() => onEdit(user)}
                          className={`${styles.actionButton} ${styles.editButton}`}
                          title="Düzenle"
                        >
                          <PencilIcon className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(user._id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Sil"
                        >
                          <TrashIcon className={styles.actionIcon} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className={styles.mobileCardContainer}>
        {users.map((user) => (
          <div key={user._id} className={styles.userCard}>
            {/* Card Header - User Info */}
            <div className={styles.cardHeader}>
              <div className={styles.cardUserInfo}>
                <div className={`${styles.avatar} ${getRoleColor(user.role)}`}>
                  <span className={styles.avatarText}>
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{formatUserName(user)}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>
              {getRoleBadge(user.role)}
            </div>
            
            {/* Card Details */}
            <div className={styles.cardDetails}>
              <div className={styles.cardDetailItem}>
                <div className={styles.cardDetailLabel}>Durum</div>
                <div className={styles.cardDetailValue}>
                  <div className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {user.isActive ? (
                      <CheckBadgeIcon className={styles.statusIcon} />
                    ) : (
                      <XCircleIcon className={styles.statusIcon} />
                    )}
                    <span>{user.isActive ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.cardDetailItem}>
                <div className={styles.cardDetailLabel}>Google Calendar</div>
                <div className={styles.cardDetailValue}>
                  <div className={`${styles.googleBadge} ${user.googleConnected ? styles.googleConnected : styles.googleNotConnected}`}>
                    {user.googleConnected ? (
                      <CheckBadgeIcon className={styles.googleIcon} />
                    ) : (
                      <XCircleIcon className={styles.googleIcon} />
                    )}
                    <span>{user.googleConnected ? 'Bağlı' : 'Bağlı Değil'}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.cardDetailItem}>
                <div className={styles.cardDetailLabel}>Bölüm</div>
                <div className={styles.cardDetailValue}>
                  <span className={styles.departmentText}>{user.department || 'Belirtilmemiş'}</span>
                </div>
              </div>
            </div>
            
            {/* Card Actions */}
            <div className={styles.cardMainActions}>
              <button
                onClick={() => onViewAppointmentHistory && onViewAppointmentHistory(user)}
                className={`${styles.cardActionButton} ${styles.history}`}
                title="Randevu Geçmişi"
              >
                <ClockIcon className={styles.actionIcon} />
                <span>Randevu Geçmişi</span>
              </button>
              
              {user.role === 'student' ? (
                <button
                  onClick={() => onViewStudent(user)}
                  className={`${styles.cardActionButton} ${styles.view}`}
                  title="Bilgileri Görüntüle"
                >
                  <EyeIcon className={styles.actionIcon} />
                  <span>Bilgileri Görüntüle</span>
                </button>
              ) : (
                <button
                  onClick={() => onEdit(user)}
                  className={`${styles.cardActionButton} ${styles.edit}`}
                  title="Düzenle"
                >
                  <PencilIcon className={styles.actionIcon} />
                  <span>Düzenle</span>
                </button>
              )}
              
              <button
                onClick={() => onDelete && onDelete(user._id)}
                className={`${styles.cardActionButton} ${styles.delete}`}
                title="Sil"
              >
                <TrashIcon className={styles.actionIcon} />
                <span>Sil</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className={styles.emptyState}>
          <UserIcon className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Henüz kullanıcı yok</h3>
          <p className={styles.emptyDescription}>
            Yeni bir öğretim üyesi ekleyerek başlayın.
          </p>
        </div>
      )}
    </div>
  );
} 