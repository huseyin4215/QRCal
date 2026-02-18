import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, UserIcon, CalendarDaysIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';

const GizlilikPolitikasi = () => {
    return (
        <div className="policy-container">
            <div className="policy-content">
                {/* Header */}
                <div className="policy-header">
                    <div className="policy-icon">
                        <ShieldCheckIcon />
                    </div>
                    <h1 className="policy-title">Privacy Policy / Gizlilik Politikası</h1>
                    <p className="policy-subtitle">Last updated / Son güncelleme: 19.02.2026</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Qnnect — Ankara University Appointment Management System
                    </p>
                </div>

                {/* Content */}
                <div className="policy-card">

                    {/* Introduction */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <EyeIcon />
                            Introduction / Giriş
                        </h2>
                        <p className="policy-text">
                            Qnnect is an appointment management system developed as a university project at
                            Ankara University, Faculty of Engineering. It enables faculty members and students
                            to manage appointments through QR codes and Google Calendar integration.
                        </p>
                        <p className="policy-text" style={{ marginTop: '0.75rem' }}>
                            Qnnect olarak, kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerin korunmasına
                            büyük önem veriyoruz. Bu gizlilik politikası, uygulamamızı kullanırken hangi bilgileri topladığımızı,
                            nasıl kullandığımızı ve koruduğumuzu açıklar.
                        </p>
                        <p className="policy-text" style={{ marginTop: '0.75rem' }}>
                            <strong>Application URL:</strong>{' '}
                            <a href="https://qrnnect.com" style={{ color: '#1D3F87' }}>https://qrnnect.com</a>
                        </p>
                    </section>

                    {/* Google API Services - CRITICAL FOR VERIFICATION */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <CalendarDaysIcon />
                            Google API Services Usage / Google API Hizmetleri Kullanımı
                        </h2>
                        <div style={{ background: '#EEF2FF', padding: '1.5rem', borderRadius: '0.75rem', border: '2px solid #818CF8', marginBottom: '1.5rem' }}>
                            <p style={{ color: '#3730A3', fontWeight: '600', marginBottom: '0.75rem', fontSize: '1rem' }}>
                                ⚠️ Google API Disclosure / Google API Açıklaması
                            </p>
                            <p style={{ color: '#3730A3', lineHeight: '1.6' }}>
                                Qnnect's use and transfer to any other app of information received from Google APIs will adhere to{' '}
                                <a href="https://developers.google.com/terms/api-services-user-data-policy"
                                    target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: '600' }}>
                                    Google API Services User Data Policy
                                </a>, including the Limited Use requirements.
                            </p>
                        </div>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.75rem' }}>
                            Requested OAuth Scopes and Justification / İstenen OAuth İzinleri ve Gerekçeleri
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Scope 1 */}
                            <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #22C55E' }}>
                                <p style={{ fontWeight: '600', color: '#166534', marginBottom: '0.25rem' }}>
                                    <code style={{ background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                                        userinfo.email
                                    </code>
                                </p>
                                <p style={{ color: '#15803D', fontSize: '0.875rem' }}>
                                    <strong>Purpose:</strong> To identify and authenticate users via their Google account email address.
                                    Used for login/registration and matching appointment records to the correct user.
                                </p>
                                <p style={{ color: '#15803D', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    <strong>Amaç:</strong> Kullanıcıları Google hesap e-postası ile tanımlamak ve doğrulamak.
                                    Giriş/kayıt ve randevu kayıtlarını doğru kullanıcıyla eşleştirmek için kullanılır.
                                </p>
                            </div>

                            {/* Scope 2 */}
                            <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #22C55E' }}>
                                <p style={{ fontWeight: '600', color: '#166534', marginBottom: '0.25rem' }}>
                                    <code style={{ background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                                        userinfo.profile
                                    </code>
                                </p>
                                <p style={{ color: '#15803D', fontSize: '0.875rem' }}>
                                    <strong>Purpose:</strong> To retrieve the user's name and profile picture for display within
                                    the application. This personalizes the user experience and helps students identify faculty members.
                                </p>
                                <p style={{ color: '#15803D', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    <strong>Amaç:</strong> Kullanıcının adını ve profil fotoğrafını uygulama içinde görüntülemek.
                                </p>
                            </div>

                            {/* Scope 3 - SENSITIVE */}
                            <div style={{ background: '#FFF7ED', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #F97316' }}>
                                <p style={{ fontWeight: '600', color: '#9A3412', marginBottom: '0.25rem' }}>
                                    <code style={{ background: '#FFEDD5', padding: '2px 6px', borderRadius: '4px' }}>
                                        calendar.events
                                    </code>
                                    <span style={{ background: '#FED7AA', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                        Sensitive Scope
                                    </span>
                                </p>
                                <p style={{ color: '#9A3412', fontSize: '0.875rem' }}>
                                    <strong>Purpose:</strong> To create, update, and delete appointment events on the faculty member's
                                    Google Calendar when appointments are booked, modified, or cancelled through Qnnect. This is the core
                                    functionality of the application — syncing university appointments with Google Calendar.
                                </p>
                                <p style={{ color: '#9A3412', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    <strong>Amaç:</strong> Öğretim elemanının Google Takvimine randevu etkinlikleri oluşturmak,
                                    güncellemek ve silmek için kullanılır. Qnnect üzerinden randevu alındığında, değiştirildiğinde
                                    veya iptal edildiğinde takvim otomatik olarak güncellenir.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', border: '1px solid #E5E7EB' }}>
                            <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                What we DO NOT do with your Google data:
                            </h4>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: '#4B5563', fontSize: '0.875rem' }}>
                                <li>We do NOT sell your Google data to third parties</li>
                                <li>We do NOT use your Google data for advertising purposes</li>
                                <li>We do NOT share your Google data with third parties except as described in this policy</li>
                                <li>We do NOT store your Google Calendar data permanently — events are created/modified in real-time</li>
                                <li>We do NOT read or access any calendar events other than those created by Qnnect</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Collection */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            Data We Collect / Toplanan Veriler
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Personal Information / Kişisel Bilgiler
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>Name and email address (Ad, soyad ve e-posta adresi)</li>
                                    <li>User role: student, faculty, or admin (Kullanıcı rolü)</li>
                                    <li>Profile picture from Google account (Google hesabından profil fotoğrafı)</li>
                                    <li>Department and office information (Bölüm ve ofis bilgileri)</li>
                                </ul>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <CalendarDaysIcon />
                                    Appointment Data / Randevu Verileri
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>Appointment dates, times, and topics (Randevu tarih, saat ve konuları)</li>
                                    <li>Appointment status: pending, approved, rejected, cancelled (Randevu durumu)</li>
                                    <li>Faculty availability schedules (Öğretim elemanı müsaitlik takvimi)</li>
                                </ul>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <GlobeAltIcon />
                                    Technical Data / Teknik Veriler
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>IP address and device information (IP adresi ve cihaz bilgileri)</li>
                                    <li>Browser type and version (Tarayıcı türü ve versiyonu)</li>
                                    <li>Login/logout timestamps (Giriş/çıkış zamanları)</li>
                                    <li>Cookies for session management (Oturum yönetimi çerezleri)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Data */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            How We Use Your Data / Verilerin Kullanım Amacı
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">Appointment Management</h3>
                                <p className="policy-feature-text">
                                    Creating, managing, and synchronizing appointments between faculty and students
                                    via QR codes and Google Calendar integration.
                                </p>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">Authentication</h3>
                                <p className="policy-feature-text">
                                    Verifying user identity through Google OAuth 2.0 and managing secure sessions.
                                </p>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">Communication</h3>
                                <p className="policy-feature-text">
                                    Sending appointment notifications, reminders, and service-related updates via email.
                                </p>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">Service Improvement</h3>
                                <p className="policy-feature-text">
                                    Analyzing usage patterns to improve the application's functionality and user experience.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Storage and Retention */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <LockClosedIcon />
                            Data Storage & Retention / Veri Saklama ve Süreleri
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: '#F0F9FF', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3B82F6' }}>
                                <h4 style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>Account Data</h4>
                                <p style={{ color: '#1E40AF', fontSize: '0.875rem' }}>
                                    Stored securely in MongoDB database hosted on MongoDB Atlas (cloud).
                                    Retained for the duration of the user's active account. Deleted upon account deletion request.
                                </p>
                            </div>
                            <div style={{ background: '#F0F9FF', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3B82F6' }}>
                                <h4 style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>Google OAuth Tokens</h4>
                                <p style={{ color: '#1E40AF', fontSize: '0.875rem' }}>
                                    Refresh tokens are stored encrypted in our database. Access tokens are short-lived and not stored permanently.
                                    Tokens are revoked and deleted when the user disconnects Google Calendar or deletes their account.
                                </p>
                            </div>
                            <div style={{ background: '#F0F9FF', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3B82F6' }}>
                                <h4 style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>Google Calendar Events</h4>
                                <p style={{ color: '#1E40AF', fontSize: '0.875rem' }}>
                                    Calendar events are created directly in the user's Google Calendar via API.
                                    We store only the Google Calendar event ID in our database for reference.
                                    We do NOT store the full calendar event data on our servers.
                                </p>
                            </div>
                            <div style={{ background: '#F0F9FF', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3B82F6' }}>
                                <h4 style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>Appointment Records</h4>
                                <p style={{ color: '#1E40AF', fontSize: '0.875rem' }}>
                                    Appointment data is retained for the academic period. Users can request deletion of their
                                    appointment history at any time by contacting us.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <LockClosedIcon />
                            Data Sharing / Veri Paylaşımı
                        </h2>
                        <p className="policy-text">
                            We do NOT sell, trade, or rent your personal data. We share data only in the following limited cases:
                        </p>
                        <div className="policy-highlight-box">
                            <ul className="policy-feature-list">
                                <li><strong>Google Calendar API:</strong> Appointment data is sent to Google Calendar to create/update/delete events on the faculty member's calendar</li>
                                <li><strong>Between users:</strong> Students can see faculty member's name, department, and available time slots. Faculty can see student name and email for booked appointments</li>
                                <li><strong>Legal requirements:</strong> If required by Turkish law or court order</li>
                                <li><strong>Service providers:</strong> MongoDB Atlas (database hosting), Render/Vercel (application hosting) — bound by their own privacy policies</li>
                            </ul>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            Your Rights / Kullanıcı Hakları
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h4 className="policy-feature-title">Access / Erişim</h4>
                                <p className="policy-feature-text">Request a copy of your personal data we hold</p>
                            </div>
                            <div className="policy-feature-card">
                                <h4 className="policy-feature-title">Correction / Düzeltme</h4>
                                <p className="policy-feature-text">Request correction of inaccurate personal data</p>
                            </div>
                            <div className="policy-feature-card">
                                <h4 className="policy-feature-title">Deletion / Silme</h4>
                                <p className="policy-feature-text">Request deletion of your account and all associated data</p>
                            </div>
                            <div className="policy-feature-card">
                                <h4 className="policy-feature-title">Revoke Google Access / Google Erişimini İptal</h4>
                                <p className="policy-feature-text">
                                    You can revoke Qnnect's access to your Google account at any time via{' '}
                                    <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer"
                                        style={{ color: '#1D3F87', textDecoration: 'underline' }}>
                                        Google Account Permissions
                                    </a>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <LockClosedIcon />
                            Data Security / Veri Güvenliği
                        </h2>
                        <div className="policy-highlight-box">
                            <ul className="policy-feature-list">
                                <li>All data transmitted via HTTPS/TLS encryption (SSL sertifikası ile şifreli iletişim)</li>
                                <li>Passwords hashed using bcrypt with salt (Şifreler bcrypt ile hash'lenir)</li>
                                <li>Google OAuth tokens stored encrypted (Google OAuth token'ları şifreli saklanır)</li>
                                <li>MongoDB Atlas with encryption at rest (Veritabanı şifreli depolama)</li>
                                <li>Regular security audits and dependency updates (Düzenli güvenlik denetimleri)</li>
                                <li>Access control and role-based authorization (Erişim kontrolü ve rol tabanlı yetkilendirme)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Children */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">Children's Privacy / Çocukların Gizliliği</h2>
                        <p className="policy-text">
                            Qnnect is designed for university students and faculty members. We do not knowingly
                            collect data from children under 18. If you believe a child has provided us with personal
                            data, please contact us and we will delete it promptly.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="policy-contact">
                        <h2 className="policy-contact-title">Contact / İletişim</h2>
                        <p className="policy-text">
                            For questions about this privacy policy or to exercise your data rights, contact us:
                        </p>
                        <div className="policy-contact-info">
                            <div className="policy-contact-item">
                                <span className="policy-contact-label">E-posta / Email</span>
                                <span className="policy-contact-value">infoqrcal@gmail.com</span>
                            </div>
                            <div className="policy-contact-item">
                                <span className="policy-contact-label">Project</span>
                                <span className="policy-contact-value">Ankara University — Faculty of Engineering</span>
                            </div>
                            <div className="policy-contact-item">
                                <span className="policy-contact-label">Address / Adres</span>
                                <span className="policy-contact-value">Ankara Üniversitesi, Gölbaşı Kampüsü, Ankara, Türkiye</span>
                            </div>
                        </div>
                    </section>

                    {/* Updates */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates / Politika Güncellemeleri</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this privacy policy from time to time. When we make significant changes,
                            we will notify users via email. The current version is always available at{' '}
                            <a href="https://qrnnect.com/privacy" style={{ color: '#1D3F87' }}>https://qrnnect.com/privacy</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GizlilikPolitikasi;
