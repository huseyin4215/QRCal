import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, UserIcon, CalendarDaysIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';
import useLanguage from '../hooks/useLanguage';
import LanguageToggle from '../components/LanguageToggle';

const GizlilikPolitikasi = () => {
    const { lang, toggleLang, isTr } = useLanguage();

    return (
        <div className="policy-container">
            <div className="policy-content">
                {/* Header */}
                <div className="policy-header">
                    <div className="policy-icon">
                        <ShieldCheckIcon />
                    </div>
                    <h1 className="policy-title">
                        {isTr ? 'Gizlilik Politikası' : 'Privacy Policy'}
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
                            <EyeIcon />
                            {isTr ? 'Giriş' : 'Introduction'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Qrnnect olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, hizmetimizi kullandığınızda hangi bilgilerin toplandığını, nasıl kullanıldığını ve nasıl korunduğunu açıklar.'
                                : 'At Qrnnect, we value your privacy. This Privacy Policy explains what information is collected when you use our Service, how it is used, and how it is protected.'}
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            {isTr ? 'Toplanan Bilgiler' : 'Information We Collect'}
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Hesap Bilgileri' : 'Account Information'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr ? 'Kayıt sırasında sağladığınız bilgiler:' : 'Information you provide during registration:'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Ad ve soyad' : 'First and last name'}</li>
                                    <li>{isTr ? 'E-posta adresi (@ankara.edu.tr)' : 'Email address (@ankara.edu.tr)'}</li>
                                    <li>{isTr ? 'Bölüm ve unvan bilgisi' : 'Department and title information'}</li>
                                    <li>{isTr ? 'Profil fotoğrafı (isteğe bağlı)' : 'Profile photo (optional)'}</li>
                                </ul>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Randevu Verileri' : 'Appointment Data'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr ? 'Hizmeti kullanırken oluşan veriler:' : 'Data generated through your use of the Service:'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Randevu tarihleri ve saatleri' : 'Appointment dates and times'}</li>
                                    <li>{isTr ? 'Randevu notları ve açıklamaları' : 'Appointment notes and descriptions'}</li>
                                    <li>{isTr ? 'Randevu durumu (onaylandı, iptal edildi vb.)' : 'Appointment status (approved, cancelled, etc.)'}</li>
                                    <li>{isTr ? 'QR kod verileri' : 'QR code data'}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Google Calendar */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <CalendarDaysIcon />
                            {isTr ? 'Google Takvim Verileri' : 'Google Calendar Data'}
                        </h2>
                        <div className="policy-highlight-box">
                            <p className="policy-highlight-text">
                                {isTr
                                    ? 'Google Takvim entegrasyonunu etkinleştirdiğinizde, aşağıdaki verilere erişim izni vermiş olursunuz:'
                                    : 'When you enable Google Calendar integration, you grant access to the following data:'}
                            </p>
                            <ul className="policy-feature-list" style={{ marginTop: '1rem' }}>
                                <li>{isTr ? 'Takvim etkinlikleriniz (müsaitlik kontrolü için)' : 'Your calendar events (for availability checking)'}</li>
                                <li>{isTr ? 'Yeni etkinlik oluşturma izni' : 'Permission to create new events'}</li>
                                <li>{isTr ? 'Etkinlik güncelleme ve silme izni' : 'Permission to update and delete events'}</li>
                            </ul>
                            <p className="policy-highlight-text" style={{ marginTop: '1rem' }}>
                                <strong>{isTr ? 'Önemli:' : 'Important:'}</strong>{' '}
                                {isTr
                                    ? 'Google Takvim verileriniz yalnızca randevu senkronizasyonu için kullanılır. Üçüncü taraflarla paylaşılmaz ve sunucularımızda kalıcı olarak saklanmaz.'
                                    : 'Your Google Calendar data is used only for appointment synchronization. It is not shared with third parties and is not permanently stored on our servers.'}
                            </p>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Bilgilerin Kullanımı' : 'How We Use Information'}
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Hizmet Sağlama' : 'Service Delivery'}
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Randevu oluşturma ve yönetimi' : 'Appointment creation and management'}</li>
                                    <li>{isTr ? 'E-posta bildirimleri gönderme' : 'Sending email notifications'}</li>
                                    <li>{isTr ? 'QR kod oluşturma' : 'QR code generation'}</li>
                                    <li>{isTr ? 'Google Takvim senkronizasyonu' : 'Google Calendar synchronization'}</li>
                                </ul>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Güvenlik ve İyileştirme' : 'Security & Improvement'}
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Hesap güvenliğini sağlama' : 'Ensuring account security'}</li>
                                    <li>{isTr ? 'Hizmet kalitesini iyileştirme' : 'Improving service quality'}</li>
                                    <li>{isTr ? 'Teknik sorunları teşhis etme' : 'Diagnosing technical issues'}</li>
                                    <li>{isTr ? 'Yasal yükümlülüklere uyma' : 'Complying with legal obligations'}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Protection */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <LockClosedIcon />
                            {isTr ? 'Veri Koruma' : 'Data Protection'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:'
                                : 'We implement industry-standard security measures to protect your data:'}
                        </p>
                        <ul className="policy-feature-list">
                            <li>{isTr ? 'SSL/TLS ile şifreli veri iletimi' : 'Encrypted data transmission with SSL/TLS'}</li>
                            <li>{isTr ? 'Güvenli veritabanı depolaması' : 'Secure database storage'}</li>
                            <li>{isTr ? 'OAuth 2.0 ile güvenli Google entegrasyonu' : 'Secure Google integration via OAuth 2.0'}</li>
                            <li>{isTr ? 'Düzenli güvenlik güncellemeleri' : 'Regular security updates'}</li>
                        </ul>
                    </section>

                    {/* Data Sharing */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <GlobeAltIcon />
                            {isTr ? 'Veri Paylaşımı' : 'Data Sharing'}
                        </h2>
                        <div className="policy-highlight-box" style={{ borderLeftColor: '#10b981' }}>
                            <p className="policy-highlight-text">
                                {isTr
                                    ? 'Kişisel verilerinizi üçüncü taraflarla satmıyoruz. Verileriniz yalnızca aşağıdaki durumda paylaşılabilir:'
                                    : 'We do not sell your personal data to third parties. Your data may only be shared in these circumstances:'}
                            </p>
                            <ul className="policy-feature-list" style={{ marginTop: '1rem' }}>
                                <li>{isTr ? 'Google Takvim senkronizasyonu (yalnızca izninizle)' : 'Google Calendar synchronization (only with your permission)'}</li>
                                <li>{isTr ? 'Yasal zorunluluklar (mahkeme kararı vb.)' : 'Legal requirements (court orders, etc.)'}</li>
                                <li>{isTr ? 'Hizmet sağlayıcılar (e-posta gönderimi için)' : 'Service providers (for email delivery)'}</li>
                            </ul>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Kullanıcı Hakları' : 'Your Rights'}
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Erişim ve Düzeltme' : 'Access & Correction'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Kişisel verilerinize erişme ve yanlış bilgileri düzeltme hakkınız vardır.'
                                        : 'You have the right to access your personal data and correct any inaccuracies.'}
                                </p>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Silme' : 'Deletion'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Hesabınızı ve ilişkili verileri silme talebinde bulunabilirsiniz.'
                                        : 'You may request deletion of your account and associated data.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Policy Changes */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Politika Değişiklikleri' : 'Policy Changes'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda, kullanıcılarımızı bilgilendireceğiz.'
                                : 'We may update this Privacy Policy from time to time. When significant changes occur, we will notify our users.'}
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="policy-contact">
                        <h2 className="policy-contact-title">
                            {isTr ? 'İletişim' : 'Contact'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Gizlilik politikamız hakkında sorularınız varsa, lütfen bizimle iletişime geçin:'
                                : 'If you have questions about our privacy policy, please contact us:'}
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

export default GizlilikPolitikasi;
