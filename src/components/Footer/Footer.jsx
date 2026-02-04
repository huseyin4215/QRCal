import React from 'react';
import { HeartIcon, AcademicCapIcon, QrCodeIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Company/App Info */}
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <QrCodeIcon className={styles.logoIcon} />
              <h3 className={styles.logoText}>Qnnect</h3>
            </div>
            <p className={styles.footerDescription}>
              Öğretim elemanları ve öğrenciler için modern randevu yönetim sistemi. 
              QR kod teknolojisi ile kolay ve hızlı randevu alma deneyimi.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Hızlı Bağlantılar</h4>
            <ul className={styles.footerLinks}>
              <li><a href="/" className={styles.footerLink}>Anasayfa</a></li>
              <li><a href="/qr-code" className={styles.footerLink}>QR Kod Oluştur</a></li>
              <li><a href="/appointments" className={styles.footerLink}>Randevular</a></li>
              {/* Profil bağlantısı kaldırıldı */}
              <li><a href="/help" className={styles.footerLink}>Yardım</a></li>
            </ul>
          </div>

          {/* Features */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Özellikler</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#" className={styles.footerLink}>QR Kod Oluşturma</a></li>
              <li><a href="#" className={styles.footerLink}>Randevu Yönetimi</a></li>
              <li><a href="#" className={styles.footerLink}>Google Calendar Entegrasyonu</a></li>
              <li><a href="#" className={styles.footerLink}>Müsaitlik Takvimi</a></li>
              <li><a href="#" className={styles.footerLink}>Bildirim Sistemi</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>İletişim</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <EnvelopeIcon className={styles.contactIcon} />
                <span>infoqrcal@gmail.com</span>
              </div>
              <div className={styles.contactItem}>
                <MapPinIcon className={styles.contactIcon} />
                <span>Ankara, Türkiye</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <p className={styles.copyright}>
              © {currentYear} Qnnect. Tüm hakları saklıdır.
            </p>
            <div className={styles.footerBottomLinks}>
              <a href="/privacy" className={styles.bottomLink}>Gizlilik Politikası</a>
              <a href="/terms" className={styles.bottomLink}>Kullanım Şartları</a>
              <a href="/cookies" className={styles.bottomLink}>Çerez Politikası</a>
            </div>
          </div>
          <div className={styles.madeWithLove}>
            <span>Made with</span>
            <HeartIcon className={styles.heartIcon} />
            <span>in Turkey</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 