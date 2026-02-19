import React from 'react';
import { CircleStackIcon, InformationCircleIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';
import useLanguage from '../hooks/useLanguage';
import LanguageToggle from '../components/LanguageToggle';

const CerezPolitikasi = () => {
    const { lang, toggleLang, isTr } = useLanguage();

    return (
        <div className="policy-container">
            <div className="policy-content">
                {/* Header */}
                <div className="policy-header">
                    <div className="policy-icon">
                        <CircleStackIcon />
                    </div>
                    <h1 className="policy-title">
                        {isTr ? 'Çerez Politikası' : 'Cookie Policy'}
                    </h1>
                    <p className="policy-subtitle">
                        {isTr ? `Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}` : `Last updated: ${new Date().toLocaleDateString('en-US')}`}
                    </p>
                    <LanguageToggle lang={lang} toggleLang={toggleLang} />
                </div>

                {/* Content */}
                <div className="policy-card">

                    {/* Introduction */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <InformationCircleIcon />
                            {isTr ? 'Çerezler Hakkında' : 'About Cookies'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Qrnnect web sitesi, kullanıcı deneyimini geliştirmek ve hizmet kalitesini artırmak için çerezler kullanmaktadır. Bu politika, hangi çerezlerin kullanıldığını ve nasıl yönetileceğini açıklar.'
                                : 'The Qrnnect website uses cookies to enhance user experience and improve service quality. This policy explains which cookies are used and how to manage them.'}
                        </p>
                    </section>

                    {/* What are Cookies */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Çerez Nedir?' : 'What are Cookies?'}
                        </h2>
                        <div className="policy-highlight-box">
                            <p className="policy-highlight-text">
                                {isTr
                                    ? 'Çerezler, web sitesi tarafından tarayıcınıza gönderilen küçük metin dosyalarıdır. Bu dosyalar cihazınızda saklanır ve web sitesinin sizi tanımasını, tercihlerinizi hatırlamasını ve genel kullanıcı deneyimini iyileştirmesini sağlar.'
                                    : 'Cookies are small text files sent to your browser by the website. These files are stored on your device and enable the website to recognize you, remember your preferences, and improve the overall user experience.'}
                            </p>
                        </div>
                    </section>

                    {/* Cookie Types */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Çerez Türleri' : 'Cookie Types'}
                        </h2>
                        <div className="policy-grid">
                            {/* Essential */}
                            <div className="policy-feature-card" style={{ borderLeft: '4px solid #10b981' }}>
                                <h3 className="policy-feature-title">
                                    <ShieldCheckIcon style={{ color: '#10b981' }} />
                                    {isTr ? 'Zorunlu Çerezler' : 'Essential Cookies'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Web sitesinin temel işlevlerini yerine getirmek için gereklidir ve kapatılamaz.'
                                        : 'Required for the basic functions of the website and cannot be disabled.'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Oturum çerezleri (giriş yapma durumu)' : 'Session cookies (login state)'}</li>
                                    <li>{isTr ? 'Güvenlik çerezleri (CSRF koruması)' : 'Security cookies (CSRF protection)'}</li>
                                    <li>{isTr ? 'Dil tercihi çerezleri' : 'Language preference cookies'}</li>
                                    <li>{isTr ? 'Temel site ayarları' : 'Basic site settings'}</li>
                                </ul>
                            </div>

                            {/* Functional */}
                            <div className="policy-feature-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <h3 className="policy-feature-title">
                                    {isTr ? 'İşlevsel Çerezler' : 'Functional Cookies'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Web sitesinin gelişmiş özelliklerini ve kişiselleştirmeyi sağlar.'
                                        : 'Enable advanced features and personalization of the website.'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Kullanıcı tercihleri (tema, dil)' : 'User preferences (theme, language)'}</li>
                                    <li>{isTr ? 'Form verileri (otomatik doldurma)' : 'Form data (auto-fill)'}</li>
                                    <li>{isTr ? 'Özelleştirilmiş içerik' : 'Customized content'}</li>
                                    <li>{isTr ? 'Hatırlama özellikleri' : 'Remember-me features'}</li>
                                </ul>
                            </div>

                            {/* Analytics */}
                            <div className="policy-feature-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Analitik Çerezler' : 'Analytics Cookies'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur.'
                                        : 'Help us understand how the website is being used.'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Sayfa görüntüleme sayıları' : 'Page view counts'}</li>
                                    <li>{isTr ? 'Kullanıcı etkileşim verileri' : 'User interaction data'}</li>
                                    <li>{isTr ? 'Site performans metrikleri' : 'Site performance metrics'}</li>
                                    <li>{isTr ? 'Hata raporlama' : 'Error reporting'}</li>
                                </ul>
                            </div>

                            {/* Third-party */}
                            <div className="policy-feature-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Üçüncü Taraf Çerezleri' : 'Third-Party Cookies'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Harici hizmet sağlayıcılar tarafından yerleştirilir.'
                                        : 'Placed by external service providers.'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Google Analytics çerezleri' : 'Google Analytics cookies'}</li>
                                    <li>{isTr ? 'Google Calendar entegrasyonu' : 'Google Calendar integration'}</li>
                                    <li>{isTr ? 'Sosyal medya entegrasyonları' : 'Social media integrations'}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Specific Cookies Table */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Kullanılan Çerezler' : 'Cookies Used'}
                        </h2>
                        <table className="policy-table">
                            <thead>
                                <tr>
                                    <th>{isTr ? 'Çerez Adı' : 'Cookie Name'}</th>
                                    <th>{isTr ? 'Amaç' : 'Purpose'}</th>
                                    <th>{isTr ? 'Süre' : 'Duration'}</th>
                                    <th>{isTr ? 'Tür' : 'Type'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>session_id</strong></td>
                                    <td>{isTr ? 'Kullanıcı oturumunu takip etme' : 'User session tracking'}</td>
                                    <td>{isTr ? 'Oturum sonuna kadar' : 'Until session ends'}</td>
                                    <td><span className="policy-badge essential">{isTr ? 'Zorunlu' : 'Essential'}</span></td>
                                </tr>
                                <tr>
                                    <td><strong>user_preferences</strong></td>
                                    <td>{isTr ? 'Kullanıcı tercihlerini saklama' : 'Storing user preferences'}</td>
                                    <td>{isTr ? '1 yıl' : '1 year'}</td>
                                    <td><span className="policy-badge functional">{isTr ? 'İşlevsel' : 'Functional'}</span></td>
                                </tr>
                                <tr>
                                    <td><strong>_ga</strong></td>
                                    <td>{isTr ? 'Google Analytics takibi' : 'Google Analytics tracking'}</td>
                                    <td>{isTr ? '2 yıl' : '2 years'}</td>
                                    <td><span className="policy-badge analytics">{isTr ? 'Analitik' : 'Analytics'}</span></td>
                                </tr>
                                <tr>
                                    <td><strong>google_calendar_token</strong></td>
                                    <td>{isTr ? 'Google Calendar entegrasyonu' : 'Google Calendar integration'}</td>
                                    <td>{isTr ? '1 yıl' : '1 year'}</td>
                                    <td><span className="policy-badge third-party">{isTr ? 'Üçüncü Taraf' : 'Third Party'}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Cookie Management */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <CogIcon />
                            {isTr ? 'Çerez Yönetimi' : 'Cookie Management'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Çerezleri yönetmek ve kontrol etmek için aşağıdaki seçenekleriniz bulunmaktadır:'
                                : 'You have the following options to manage and control cookies:'}
                        </p>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Tarayıcı Ayarları' : 'Browser Settings'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Tarayıcınızın ayarlarından çerezleri etkinleştirebilir, devre dışı bırakabilir veya silebilirsiniz.'
                                        : 'You can enable, disable, or delete cookies from your browser settings.'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li><strong>Chrome:</strong> {isTr ? 'Ayarlar → Gizlilik ve Güvenlik → Çerezler' : 'Settings → Privacy and Security → Cookies'}</li>
                                    <li><strong>Firefox:</strong> {isTr ? 'Ayarlar → Gizlilik ve Güvenlik → Çerezler' : 'Settings → Privacy & Security → Cookies'}</li>
                                    <li><strong>Safari:</strong> {isTr ? 'Tercihler → Gizlilik → Çerezler' : 'Preferences → Privacy → Cookies'}</li>
                                    <li><strong>Edge:</strong> {isTr ? 'Ayarlar → Çerezler ve site izinleri' : 'Settings → Cookies and site permissions'}</li>
                                </ul>
                            </div>
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    {isTr ? 'Çerez Banner\'ı' : 'Cookie Banner'}
                                </h3>
                                <p className="policy-feature-text">
                                    {isTr
                                        ? 'Sitemizde çerez tercihlerinizi yönetebileceğiniz bir banner bulunmaktadır.'
                                        : 'Our site has a cookie banner that allows you to manage your cookie preferences.'}
                                </p>
                                <ul className="policy-feature-list">
                                    <li>{isTr ? 'Çerez türlerini seçebilirsiniz' : 'You can select cookie types'}</li>
                                    <li>{isTr ? 'Tercihlerinizi değiştirebilirsiniz' : 'You can change your preferences'}</li>
                                    <li>{isTr ? 'Çerezleri toplu olarak silebilirsiniz' : 'You can delete cookies in bulk'}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cookie Consent */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Çerez Onayı' : 'Cookie Consent'}
                        </h2>
                        <div className="policy-highlight-box" style={{ borderLeftColor: '#f59e0b' }}>
                            <p className="policy-highlight-text">
                                {isTr
                                    ? 'Sitemizi kullanarak, bu çerez politikasında açıklanan çerezlerin kullanımına onay vermiş olursunuz. Çerezleri devre dışı bırakırsanız, bazı özellikler düzgün çalışmayabilir.'
                                    : 'By using our site, you consent to the use of cookies as described in this policy. If you disable cookies, some features may not function properly.'}
                            </p>
                            <p className="policy-highlight-text" style={{ marginTop: '0.5rem' }}>
                                <strong>{isTr ? 'Not:' : 'Note:'}</strong>{' '}
                                {isTr
                                    ? 'Zorunlu çerezler her zaman etkin kalacaktır çünkü bunlar sitenin temel işlevleri için gereklidir.'
                                    : 'Essential cookies will always remain active as they are required for the basic functions of the site.'}
                            </p>
                        </div>
                    </section>

                    {/* Updates */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            {isTr ? 'Politika Güncellemeleri' : 'Policy Updates'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda, kullanıcılarımızı bilgilendireceğiz. Güncel politika her zaman web sitemizde yayınlanacaktır.'
                                : 'This cookie policy may be updated from time to time. When significant changes occur, we will notify our users. The current policy is always published on our website.'}
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="policy-contact">
                        <h2 className="policy-contact-title">
                            {isTr ? 'İletişim' : 'Contact'}
                        </h2>
                        <p className="policy-text">
                            {isTr
                                ? 'Çerez politikamız hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:'
                                : 'If you have questions or concerns about our cookie policy, please contact us:'}
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

export default CerezPolitikasi;
