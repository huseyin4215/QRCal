import React from 'react';
import { DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';
import useLanguage from '../hooks/useLanguage';
import LanguageToggle from '../components/LanguageToggle';

const TermsOfUse = () => {
  const { lang, toggleLang, isTr } = useLanguage();

  return (
    <div className="policy-container">
      <div className="policy-content">
        {/* Header */}
        <div className="policy-header">
          <div className="policy-icon">
            <DocumentTextIcon />
          </div>
          <h1 className="policy-title">
            {isTr ? 'Kullanım Şartları' : 'Terms of Service'}
          </h1>
          <p className="policy-subtitle">
            {isTr ? 'Son güncelleme: 19.02.2026' : 'Last updated: 19.02.2026'}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
            Qrnnect — {isTr ? 'Ankara Üniversitesi Randevu Yönetim Sistemi' : 'Ankara University Appointment Management System'}
          </p>
          <LanguageToggle lang={lang} toggleLang={toggleLang} />
        </div>

        {/* Content */}
        <div className="policy-card">

          {/* Introduction */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              {isTr ? 'Giriş' : 'Introduction'}
            </h2>
            <p className="policy-text">
              {isTr
                ? 'Bu Kullanım Şartları ("Şartlar"), Ankara Üniversitesi Mühendislik Fakültesi bünyesinde geliştirilen Qrnnect ("Hizmet") randevu yönetim sisteminin kullanımını düzenler. Hizmeti kullanarak bu şartları kabul etmiş olursunuz. Kabul etmiyorsanız, lütfen hizmeti kullanmayınız.'
                : 'These Terms of Service ("Terms") govern your use of Qrnnect ("Service"), an appointment management system developed at Ankara University, Faculty of Engineering. By using the Service, you agree to these Terms. If you do not agree, please do not use the Service.'}
            </p>
          </section>

          {/* Service Description */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              {isTr ? 'Hizmet Açıklaması' : 'Service Description'}
            </h2>
            <div className="policy-highlight-box">
              <p className="policy-highlight-text">
                {isTr
                  ? 'Qrnnect, Ankara Üniversitesi öğretim üyeleri ve öğrencilerinin randevu planlamasını, yönetimini ve takibini sağlayan web tabanlı bir randevu yönetim platformudur. Temel özellikler:'
                  : 'Qrnnect is a web-based appointment management platform that enables faculty members and students at Ankara University to schedule, manage, and track appointments. Key features include:'}
              </p>
              <ul className="policy-feature-list" style={{ marginTop: '1rem' }}>
                <li>{isTr ? 'QR kod tabanlı randevu oluşturma ve yönetimi' : 'QR code-based appointment booking and management'}</li>
                <li>{isTr ? 'Google Takvim entegrasyonu ile otomatik etkinlik senkronizasyonu' : 'Google Calendar integration for automatic event synchronization'}</li>
                <li>{isTr ? 'Öğretim üyesi müsaitlik takvimi yönetimi' : 'Faculty availability calendar management'}</li>
                <li>{isTr ? 'Randevu güncellemeleri için e-posta bildirim sistemi' : 'Email notification system for appointment updates'}</li>
                <li>{isTr ? 'Kullanıcı profili ve bölüm yönetimi' : 'User profile and department management'}</li>
                <li>{isTr ? 'Sistem yönetimi için yönetici paneli' : 'Admin dashboard for system administration'}</li>
              </ul>
            </div>
          </section>

          {/* Google Calendar Integration */}
          <section className="policy-section">
            <h2 className="policy-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDaysIcon style={{ width: '1.5rem', height: '1.5rem' }} />
              {isTr ? 'Google Takvim Entegrasyonu' : 'Google Calendar Integration'}
            </h2>
            <div className="policy-highlight-box">
              <p className="policy-highlight-text">
                {isTr
                  ? 'Qrnnect, randevuları otomatik olarak senkronize etmek için Google Takvim API\'sini kullanır. Google Takvim\'i bağladığınızda:'
                  : 'Qrnnect uses the Google Calendar API to automatically synchronize appointments. When you connect your Google Calendar:'}
              </p>
              <ul className="policy-feature-list" style={{ marginTop: '1rem' }}>
                <li>{isTr ? 'Randevular otomatik olarak Google Takviminize eklenir' : 'Appointments are automatically added to your Google Calendar'}</li>
                <li>{isTr ? 'Mevcut etkinlikleriniz müsaitlik kontrolü için okunur' : 'Your existing events are read for availability checking'}</li>
                <li>{isTr ? 'Takvim verileri güvenli OAuth 2.0 ile korunur' : 'Calendar data is secured via OAuth 2.0'}</li>
                <li>{isTr ? 'Entegrasyonu istediğiniz zaman devre dışı bırakabilirsiniz' : 'You can disconnect the integration at any time'}</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              {isTr ? 'Kullanıcı Hesapları' : 'User Accounts'}
            </h2>
            <div className="policy-grid">
              <div className="policy-feature-card">
                <h3 className="policy-feature-title">
                  <CheckCircleIcon />
                  {isTr ? 'Kayıt Gereksinimleri' : 'Registration Requirements'}
                </h3>
                <ul className="policy-feature-list">
                  <li>{isTr ? 'Geçerli bir Ankara Üniversitesi e-postası gereklidir' : 'Valid Ankara University email required'}</li>
                  <li>{isTr ? 'Hesap başına bir kullanıcıya izin verilir' : 'One user per account allowed'}</li>
                  <li>{isTr ? 'Doğru kişisel bilgiler sağlanmalıdır' : 'Accurate personal information must be provided'}</li>
                </ul>
              </div>
              <div className="policy-feature-card">
                <h3 className="policy-feature-title">
                  <ExclamationTriangleIcon />
                  {isTr ? 'Hesap Güvenliği' : 'Account Security'}
                </h3>
                <ul className="policy-feature-list">
                  <li>{isTr ? 'Güçlü bir şifre kullanın' : 'Use a strong password'}</li>
                  <li>{isTr ? 'Hesap bilgilerinizi paylaşmayın' : 'Do not share your account credentials'}</li>
                  <li>{isTr ? 'Yetkisiz erişimi derhal bildirin' : 'Report unauthorized access immediately'}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              {isTr ? 'Kabul Edilebilir Kullanım' : 'Acceptable Use'}
            </h2>
            <div className="policy-grid">
              <div className="policy-feature-card" style={{ borderLeft: '4px solid #10b981' }}>
                <h3 className="policy-feature-title">
                  <CheckCircleIcon style={{ color: '#10b981' }} />
                  {isTr ? 'İzin Verilenler' : 'Permitted'}
                </h3>
                <ul className="policy-feature-list">
                  <li>{isTr ? 'Akademik randevuları planlamak' : 'Scheduling academic appointments'}</li>
                  <li>{isTr ? 'Profesyonel amaçlarla randevuları yönetmek' : 'Managing appointments for professional purposes'}</li>
                  <li>{isTr ? 'Randevuları takip etmek için QR kodları kullanmak' : 'Using QR codes for appointment tracking'}</li>
                </ul>
              </div>
              <div className="policy-feature-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <h3 className="policy-feature-title">
                  <XCircleIcon style={{ color: '#ef4444' }} />
                  {isTr ? 'Yasaklar' : 'Prohibited'}
                </h3>
                <ul className="policy-feature-list">
                  <li>{isTr ? 'Sisteme yetkisiz erişim girişimleri' : 'Unauthorized access attempts'}</li>
                  <li>{isTr ? 'Spam veya sahte randevular oluşturmak' : 'Creating spam or fake appointments'}</li>
                  <li>{isTr ? 'Diğer kullanıcıların hesaplarına müdahale etmek' : 'Interfering with other users\' accounts'}</li>
                  <li>{isTr ? 'Herhangi bir yasa veya düzenlemeyi ihlal etmek' : 'Violating any laws or regulations'}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              {isTr ? 'Sorumluluk Reddi' : 'Disclaimer'}
            </h2>
            <div className="policy-highlight-box" style={{ borderLeftColor: '#f59e0b' }}>
              <p className="policy-highlight-text">
                {isTr
                  ? 'Hizmet "olduğu gibi" ve "mevcut olduğu şekliyle" sunulmaktadır. Qrnnect, uygunluk, güvenilirlik veya mevcut olma konusunda hiçbir garanti vermez. Hizmeti kendi riskinizle kullanırsınız.'
                  : 'The Service is provided "as is" and "as available" without warranties of any kind. Qrnnect does not warrant that the Service will be uninterrupted, secure, or error-free. Use at your own risk.'}
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              {isTr ? 'Şartlardaki Değişiklikler' : 'Changes to Terms'}
            </h2>
            <p className="policy-text">
              {isTr
                ? 'Bu Kullanım Şartlarını zaman zaman güncelleyebiliriz. Değişiklikler yayınlandıktan sonra Hizmeti kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir.'
                : 'We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the updated Terms.'}
            </p>
          </section>

          {/* Contact */}
          <section className="policy-contact">
            <h2 className="policy-contact-title">
              {isTr ? 'İletişim' : 'Contact'}
            </h2>
            <p className="policy-text">
              {isTr
                ? 'Bu Kullanım Şartları hakkında sorularınız varsa, bizimle iletişime geçin:'
                : 'If you have questions about these Terms, please contact us:'}
            </p>
            <div className="policy-contact-info">
              <div className="policy-contact-item">
                <span className="policy-contact-label">{isTr ? 'E-posta' : 'Email'}</span>
                <span className="policy-contact-value">infoqrcal@gmail.com</span>
              </div>
              <div className="policy-contact-item">
                <span className="policy-contact-label">{isTr ? 'Adres' : 'Address'}</span>
                <span className="policy-contact-value">Ankara, {isTr ? 'Türkiye' : 'Turkey'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
