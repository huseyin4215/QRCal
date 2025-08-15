import { CogIcon, LockClosedIcon, ArrowRightOnRectangleIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import styles from './ProfileDropdown.module.css';

export default function ProfileDropdown({ user, onProfile, onPassword, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setOpen(false);
        }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.dropdownTrigger}
      >
        <div className={styles.avatar}>
          {getInitials(user?.name)}
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.name || 'Kullanıcı'}</p>
          <p className={styles.userRole}>{user?.role || 'user'}</p>
        </div>
        <ChevronDownIcon className={`${styles.chevronIcon} ${open ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`${styles.dropdownMenu} ${open ? styles.dropdownMenuOpen : ''}`}>
        {/* User Info Section */}
        <div className={styles.menuItem}>
          <UserCircleIcon className={styles.menuIcon} />
          <div>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userRole}>{user?.email}</p>
          </div>
        </div>
        
        <div className={styles.divider}></div>
        
        {/* Menu Items */}
        <button
          onClick={() => { setOpen(false); onProfile(); }}
          className={styles.menuItem}
        >
          <CogIcon className={styles.menuIcon} />
          <span>Profil Ayarları</span>
        </button>
        
        <button
          onClick={() => { setOpen(false); onPassword(); }}
          className={styles.menuItem}
        >
          <LockClosedIcon className={styles.menuIcon} />
          <span>Şifre Değiştir</span>
        </button>
        
        <div className={styles.divider}></div>
        
        <button
          onClick={() => { setOpen(false); onLogout(); }}
          className={`${styles.menuItem} ${styles.logoutItem}`}
        >
          <ArrowRightOnRectangleIcon className={styles.menuIcon} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}