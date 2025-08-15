import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  CogIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import styles from './Navigation.module.css';

const Navigation = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          {
            name: 'Ana Sayfa',
            href: '/student-dashboard',
            icon: HomeIcon
          },
          {
            name: 'Öğretim Elemanları',
            href: '/faculty-list',
            icon: UserGroupIcon
          },
          {
            name: 'Randevularım',
            href: '/my-appointments',
            icon: CalendarIcon
          },
          {
            name: 'Profil',
            href: '/profile',
            icon: CogIcon
          }
        ];

      case 'faculty':
        return [
          {
            name: 'Ana Sayfa',
            href: '/faculty-dashboard',
            icon: HomeIcon
          },
          {
            name: 'Randevular',
            href: '/faculty-appointments',
            icon: CalendarIcon
          },
          {
            name: 'Müsaitlik',
            href: '/faculty-availability',
            icon: AcademicCapIcon
          },
          {
            name: 'İstatistikler',
            href: '/faculty-stats',
            icon: ChartBarIcon
          },
          {
            name: 'Profil',
            href: '/profile',
            icon: CogIcon
          }
        ];

      case 'admin':
        return [
          {
            name: 'Ana Sayfa',
            href: '/admin-dashboard',
            icon: HomeIcon
          },
          {
            name: 'Kullanıcılar',
            href: '/admin-users',
            icon: UserGroupIcon
          },
          {
            name: 'Randevular',
            href: '/admin-appointments',
            icon: CalendarIcon
          },
          {
            name: 'İstatistikler',
            href: '/admin-stats',
            icon: ChartBarIcon
          },
          {
            name: 'Ayarlar',
            href: '/admin-settings',
            icon: CogIcon
          }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <div className={styles.navLeft}>
            {/* Logo */}
            <div className={styles.logo}>
              <h1 className={styles.logoText}>QR Calendar</h1>
            </div>

            {/* Navigation Links */}
            <div className={styles.navLinks}>
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={styles.navLink}
                >
                  <item.icon className={styles.navLinkIcon} />
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className={styles.userMenu}>
            {user && (
              <div className={styles.userInfo}>
                <div className={styles.userText}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  <ArrowRightOnRectangleIcon className={styles.logoutIcon} />
                  Çıkış
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={styles.mobileMenu}>
        <div className={styles.mobileNavLinks}>
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={styles.mobileNavLink}
            >
              <item.icon className={styles.mobileNavLinkIcon} />
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 