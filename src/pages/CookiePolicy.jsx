import React from 'react';
import { CircleStackIcon, InformationCircleIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';

const CookiePolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        {/* Header */}
        <div className="policy-header">
          <div className="policy-icon">
            <CircleStackIcon />
          </div>
          <h1 className="policy-title">Çerez Politikası</h1>
          <p className="policy-subtitle">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>

        {/* Content */}
        <div className="policy-card">
          
          {/* Introduction */}
          <section className="policy-section">
            <h2 className="policy-section-title">
              <InformationCircleIcon />
              Çerezler Hakkında
            </h2>
            <p className="policy-text">
              QR Calendar web sitesi, kullanıcı deneyimini geliştirmek ve hizmet kalitesini artırmak için 
              çerezler kullanmaktadır. Bu politika, hangi çerezlerin kullanıldığını ve nasıl yönetileceğini açıklar.
            </p>
          </section>

          {/* What are Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Çerez Nedir?</h2>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800 leading-relaxed">
                Çerezler, web sitesi tarafından tarayıcınıza gönderilen küçük metin dosyalarıdır. 
                Bu dosyalar cihazınızda saklanır ve web sitesinin sizi tanımasını, tercihlerinizi 
                hatırlamasını ve genel kullanıcı deneyimini iyileştirmesini sağlar.
              </p>
            </div>
          </section>

          {/* Cookie Types */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Çerez Türleri</h2>
            <div className="space-y-6">
              
              {/* Essential Cookies */}
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  Zorunlu Çerezler
                </h3>
                <p className="text-green-800 mb-3">
                  Bu çerezler web sitesinin temel işlevlerini yerine getirmek için gereklidir ve 
                  kapatılamaz. Güvenlik, oturum yönetimi ve temel site işlevselliği için kullanılır.
                </p>
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-green-900 mb-2">Örnekler:</h4>
                  <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                    <li>Oturum çerezleri (giriş yapma durumu)</li>
                    <li>Güvenlik çerezleri (CSRF koruması)</li>
                    <li>Dil tercihi çerezleri</li>
                    <li>Temel site ayarları</li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">İşlevsel Çerezler</h3>
                <p className="text-blue-800 mb-3">
                  Bu çerezler, web sitesinin gelişmiş özelliklerini ve kişiselleştirmeyi sağlar. 
                  Kapatılabilir ancak bazı özellikler düzgün çalışmayabilir.
                </p>
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-blue-900 mb-2">Örnekler:</h4>
                  <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                    <li>Kullanıcı tercihleri (tema, dil)</li>
                    <li>Form verileri (otomatik doldurma)</li>
                    <li>Özelleştirilmiş içerik</li>
                    <li>Hatırlama özellikleri</li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-purple-900 mb-3">Analitik Çerezler</h3>
                <p className="text-purple-800 mb-3">
                  Bu çerezler, web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur. 
                  Kullanıcı davranışlarını analiz eder ve site performansını iyileştirmemizi sağlar.
                </p>
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-purple-900 mb-2">Örnekler:</h4>
                  <ul className="list-disc list-inside text-purple-700 space-y-1 text-sm">
                    <li>Sayfa görüntüleme sayıları</li>
                    <li>Kullanıcı etkileşim verileri</li>
                    <li>Site performans metrikleri</li>
                    <li>Hata raporlama</li>
                  </ul>
                </div>
              </div>

              {/* Third-party Cookies */}
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-orange-900 mb-3">Üçüncü Taraf Çerezleri</h3>
                <p className="text-orange-800 mb-3">
                  Bu çerezler, harici hizmet sağlayıcılar tarafından yerleştirilir. 
                  Google Calendar entegrasyonu gibi özellikler için gereklidir.
                </p>
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-orange-900 mb-2">Örnekler:</h4>
                  <ul className="list-disc list-inside text-orange-700 space-y-1 text-sm">
                    <li>Google Analytics çerezleri</li>
                    <li>Google Calendar entegrasyonu</li>
                    <li>Sosyal medya entegrasyonları</li>
                    <li>Harici ödeme sistemleri</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie Management */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <CogIcon className="h-6 w-6 text-green-600 mr-2" />
              Çerez Yönetimi
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Çerezleri yönetmek ve kontrol etmek için aşağıdaki seçenekleriniz bulunmaktadır:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Tarayıcı Ayarları</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Tarayıcınızın ayarlarından çerezleri etkinleştirebilir, devre dışı bırakabilir veya silebilirsiniz.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600"><strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</p>
                    <p className="text-gray-600"><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</p>
                    <p className="text-gray-600"><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</p>
                    <p className="text-gray-600"><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Çerez Banner'ı</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Sitemizde çerez tercihlerinizi yönetebileceğiniz bir banner bulunmaktadır.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Çerez türlerini seçebilirsiniz</li>
                    <li>Tercihlerinizi değiştirebilirsiniz</li>
                    <li>Çerezleri toplu olarak silebilirsiniz</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Specific Cookies Used */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kullanılan Çerezler</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Çerez Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Amaç
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Süre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Tür
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      session_id
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Kullanıcı oturumunu takip etme
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Oturum sonuna kadar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Zorunlu
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      user_preferences
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Kullanıcı tercihlerini saklama
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      1 yıl
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        İşlevsel
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      _ga
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Google Analytics takibi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      2 yıl
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Analitik
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      google_calendar_token
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Google Calendar entegrasyonu
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      1 yıl
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Üçüncü Taraf
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Cookie Consent */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Çerez Onayı</h2>
            <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
              <p className="text-yellow-800 leading-relaxed mb-4">
                Sitemizi kullanarak, bu çerez politikasında açıklanan çerezlerin kullanımına onay vermiş olursunuz. 
                Çerezleri devre dışı bırakırsanız, bazı özellikler düzgün çalışmayabilir.
              </p>
              <p className="text-yellow-800 text-sm">
                <strong>Not:</strong> Zorunlu çerezler her zaman etkin kalacaktır çünkü bunlar sitenin 
                temel işlevleri için gereklidir.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Politika Güncellemeleri</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda, 
              kullanıcılarımızı bilgilendireceğiz. Güncel politika her zaman web sitemizde yayınlanacaktır.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim</h2>
            <p className="text-gray-700 mb-4">
              Çerez politikamız hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>E-posta:</strong> cookies@qrcalendar.com
              </p>
              <p className="text-gray-700">
                <strong>Telefon:</strong> +90 (212) 555 0123
              </p>
              <p className="text-gray-700">
                <strong>Adres:</strong> İstanbul, Türkiye
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
