import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
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
                    <h1 className="policy-title">Gizlilik Politikası</h1>
                    <p className="policy-subtitle">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>

                {/* Content */}
                <div className="policy-card">

                    {/* Introduction */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <EyeIcon />
                            Giriş
                        </h2>
                        <p className="policy-text">
                            Qnnect olarak, kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerin korunmasına
                            büyük önem veriyoruz. Bu gizlilik politikası, uygulamamızı kullanırken hangi bilgileri topladığımızı,
                            nasıl kullandığımızı ve koruduğumuzu açıklar.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            Toplanan Veriler
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Kişisel Bilgiler
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>Ad, soyad ve e-posta adresi</li>
                                    <li>Kullanıcı rolü (öğrenci, öğretim elemanı, admin)</li>
                                    <li>Profil fotoğrafı (isteğe bağlı)</li>
                                </ul>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Kullanım Verileri
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>Giriş ve çıkış zamanları</li>
                                    <li>Randevu oluşturma ve yönetim aktiviteleri</li>
                                    <li>QR kod tarama işlemleri</li>
                                    <li>Uygulama kullanım istatistikleri</li>
                                </ul>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Teknik Veriler
                                </h3>
                                <ul className="policy-feature-list">
                                    <li>IP adresi ve cihaz bilgileri</li>
                                    <li>Tarayıcı türü ve versiyonu</li>
                                    <li>İşletim sistemi bilgileri</li>
                                    <li>Çerezler ve benzer teknolojiler</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Usage */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            Verilerin Kullanım Amacı
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Hizmet Sağlama
                                </h3>
                                <p className="policy-feature-text">
                                    Randevu yönetimi, QR kod oluşturma ve takvim entegrasyonu gibi temel hizmetlerin sunulması
                                </p>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    İletişim
                                </h3>
                                <p className="policy-feature-text">
                                    Önemli güncellemeler, güvenlik uyarıları ve hizmet bildirimleri gönderimi
                                </p>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Güvenlik
                                </h3>
                                <p className="policy-feature-text">
                                    Hesap güvenliği, dolandırıcılık önleme ve sistem güvenliğinin sağlanması
                                </p>
                            </div>

                            <div className="policy-feature-card">
                                <h3 className="policy-feature-title">
                                    <UserIcon />
                                    Geliştirme
                                </h3>
                                <p className="policy-feature-text">
                                    Hizmet kalitesinin artırılması ve yeni özelliklerin geliştirilmesi
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <LockClosedIcon />
                            Veri Paylaşımı
                        </h2>
                        <p className="policy-text">
                            Kişisel verilerinizi üçüncü taraflarla paylaşmıyoruz, ancak aşağıdaki durumlar hariç:
                        </p>
                        <div className="policy-highlight-box">
                            <ul className="policy-feature-list">
                                <li>Yasal zorunluluk durumunda</li>
                                <li>Kullanıcı açık rızası ile</li>
                                <li>Hizmet sağlayıcılarımızla (Google Calendar entegrasyonu gibi)</li>
                                <li>Güvenlik ve dolandırıcılık önleme amaçlı</li>
                            </ul>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <UserIcon />
                            Kullanıcı Hakları
                        </h2>
                        <div className="policy-grid">
                            <div className="policy-feature-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">1</span>
                                    </div>
                                    <h4 className="policy-feature-title">Erişim Hakkı</h4>
                                </div>
                                <p className="policy-feature-text">Kişisel verilerinize erişim talep edebilirsiniz</p>
                            </div>

                            <div className="policy-feature-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">2</span>
                                    </div>
                                    <h4 className="policy-feature-title">Düzeltme Hakkı</h4>
                                </div>
                                <p className="policy-feature-text">Yanlış verilerinizi düzeltebilirsiniz</p>
                            </div>

                            <div className="policy-feature-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">3</span>
                                    </div>
                                    <h4 className="policy-feature-title">Silme Hakkı</h4>
                                </div>
                                <p className="policy-feature-text">Verilerinizin silinmesini talep edebilirsiniz</p>
                            </div>

                            <div className="policy-feature-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">4</span>
                                    </div>
                                    <h4 className="policy-feature-title">İtiraz Hakkı</h4>
                                </div>
                                <p className="policy-feature-text">Veri işlemeye itiraz edebilirsiniz</p>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="policy-section">
                        <h2 className="policy-section-title">
                            <LockClosedIcon />
                            Veri Güvenliği
                        </h2>
                        <p className="policy-text">
                            Verilerinizi korumak için aşağıdaki güvenlik önlemlerini uyguluyoruz:
                        </p>
                        <div className="policy-highlight-box">
                            <ul className="policy-feature-list">
                                <li>SSL/TLS şifreleme ile güvenli veri aktarımı</li>
                                <li>Güçlü şifreleme algoritmaları ile veri saklama</li>
                                <li>Düzenli güvenlik denetimleri ve güncellemeler</li>
                                <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                                <li>Veri yedekleme ve felaket kurtarma planları</li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="policy-contact">
                        <h2 className="policy-contact-title">İletişim</h2>
                        <p className="policy-text">
                            Gizlilik politikamız hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:
                        </p>
                        <div className="policy-contact-info">
                            <div className="policy-contact-item">
                                <span className="policy-contact-label">E-posta</span>
                                <span className="policy-contact-value">infoqrcal@gmail.com</span>
                            </div>
                            <div className="policy-contact-item">
                                <span className="policy-contact-label">Adres</span>
                                <span className="policy-contact-value">Ankara, Türkiye</span>
                            </div>
                        </div>
                    </section>

                    {/* Updates */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Politika Güncellemeleri</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda,
                            kullanıcılarımızı e-posta ile bilgilendireceğiz. Güncel politika her zaman web sitemizde
                            yayınlanacaktır.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GizlilikPolitikasi;
