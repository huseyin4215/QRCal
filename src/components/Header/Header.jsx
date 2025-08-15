import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import styles from './Header.module.css';

export default function Header({ user, onProfile, onPassword, onLogout, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          {children}
        </div>
        <div className={styles.headerRight}>
          <ProfileDropdown 
            user={user} 
            onProfile={onProfile} 
            onPassword={onPassword} 
            onLogout={onLogout} 
          />
        </div>
      </div>
    </header>
  );
}