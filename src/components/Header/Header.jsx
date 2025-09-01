import { useState } from 'react';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import { BellIcon, QrCodeIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';

export default function Header({ user, onProfile, onPassword, onLogout, children, notifications = [], unreadCount = 0, onToggleNotifications, onMarkAllRead, onNotificationClick, showNotifications, theme = 'admin' }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const themeClass = theme === 'faculty' ? styles.themeFaculty : theme === 'student' ? styles.themeStudent : styles.themeAdmin;
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`${styles.header} ${themeClass}`}>
      <div className={styles.headerContainer}>
        {/* Logo/Brand Section */}
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <QrCodeIcon className={styles.logoIcon} />
            <span className={styles.logoText}>Qnnect</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={styles.navigation}>
          {children}
        </nav>

        {/* User Actions */}
        <div className={styles.userActions}>
          {/* Notification Bell */}
          {notifications && (
            <div className={styles.notificationContainer}>
              <button
                onClick={onToggleNotifications}
                className={styles.notificationButton}
                title="Bildirimler"
              >
                <BellIcon className={styles.notificationIcon} />
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={styles.notificationsDropdown}>
                  <div className={styles.notificationsHeader}>
                    <h3 className={styles.notificationsTitle}>Bildirimler</h3>
                    {notifications.length > 0 && unreadCount > 0 && (
                      <button
                        onClick={() => {
                          if (onMarkAllRead) {
                            onMarkAllRead();
                          }
                        }}
                        className={styles.markAllReadButton}
                      >
                        Tümünü Okundu İşaretle
                      </button>
                    )}
                  </div>

                  <div className={styles.notificationsList}>
                    {notifications.length === 0 ? (
                      <div className={styles.noNotifications}>
                        <BellIcon className={styles.noNotificationsIcon} />
                        <p>Henüz bildirim yok</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => {
                        const ts = n.createdAt || n.timestamp;
                        const key = n.id || n._id || ts || Math.random();
                        return (
                          <div
                            key={key}
                            className={`${styles.notificationItem} ${!n.read ? styles.unread : ''}`}
                            onClick={() => {
                              if (onNotificationClick) {
                                onNotificationClick(n);
                              }
                              onToggleNotifications();
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className={styles.notificationContent}>
                              <h4 className={styles.notificationTitle}>{n.title}</h4>
                              <p className={styles.notificationMessage}>{n.message}</p>
                              <span className={styles.notificationTime}>
                                {ts ? new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {notifications.length > 10 && (
                    <div className={styles.notificationsFooter}>
                      <p className={styles.notificationsFooterText}>
                        {notifications.length - 10} daha fazla bildirim
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <ProfileDropdown
            user={user}
            onProfile={onProfile}
            onPassword={onPassword}
            onLogout={onLogout}
          />

          {/* Mobile toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsMobileNavOpen(prev => !prev)}
            aria-label="Menüyü Aç/Kapat"
          >
            <Bars3Icon className={styles.mobileToggleIcon} />
          </button>
        </div>
      </div>
      <div className={styles.headerAccentBar}></div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <>
          <div
            className={styles.mobileNavOverlay}
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className={styles.mobileNav}>
            <div className={styles.mobileNavContent}>
              {/* Mobile Nav Header */}
              <div className={styles.mobileNavHeader}>
                <div className={styles.mobileNavBrand}>
                  <QrCodeIcon className={styles.logoIcon} />
                  <span className={styles.logoText}>Qnnect</span>
                </div>
                                <div className={styles.mobileNavActions}>
                  {/* Notification Bell */}
                  {notifications && (
                    <div className={styles.notificationContainer}>
                      <button
                        onClick={onToggleNotifications}
                        className={styles.notificationButton}
                        title="Bildirimler"
                      >
                        <BellIcon className={styles.notificationIcon} />
                        {unreadCount > 0 && (
                          <span className={styles.notificationBadge}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notifications Dropdown */}
                      {showNotifications && (
                        <div className={styles.notificationsDropdown}>
                          <div className={styles.notificationsHeader}>
                            <h3 className={styles.notificationsTitle}>Bildirimler</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={() => {
                                  if (onMarkAllRead) {
                                    onMarkAllRead();
                                  }
                                  onToggleNotifications();
                                }}
                                className={styles.markAllReadButton}
                              >
                                Tümünü Okundu İşaretle
                              </button>
                            )}
                          </div>

                          <div className={styles.notificationsList}>
                            {notifications.length === 0 ? (
                              <div className={styles.noNotifications}>
                                <BellIcon className={styles.noNotificationsIcon} />
                                <p>Henüz bildirim yok</p>
                              </div>
                            ) : (
                              notifications.slice(0, 10).map((n) => {
                                const ts = n.createdAt || n.timestamp;
                                const key = n.id || n._id || ts || Math.random();
                                return (
                                  <div
                                    key={key}
                                    className={`${styles.notificationItem} ${!n.read ? styles.unread : ''} ${styles.clickable}`}
                                    onClick={() => {
                                      if (onNotificationClick) {
                                        onNotificationClick(n);
                                      }
                                      onToggleNotifications(); // Bildirim popup'ını kapat
                                    }}
                                  >
                                    <div className={styles.notificationContent}>
                                      <h4 className={styles.notificationTitle}>{n.title}</h4>
                                      <p className={styles.notificationMessage}>{n.message}</p>
                                      <span className={styles.notificationTime}>
                                        {ts ? new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {notifications.length > 10 && (
                            <div className={styles.notificationsFooter}>
                              <p className={styles.notificationsFooterText}>
                                {notifications.length - 10} daha fazla bildirim
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <ProfileDropdown
                    user={user}
                    onProfile={onProfile}
                    onPassword={onPassword}
                    onLogout={onLogout}
                  />
                  <button
                    className={styles.mobileNavClose}
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-label="Menüyü Kapat"
                  >
                    <XMarkIcon className={styles.mobileNavCloseIcon} />
                  </button>
                </div>
              </div>

              {/* Mobile Nav Body */}
              <div className={styles.mobileNavBody}>
                {children}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}