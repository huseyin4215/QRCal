import React from 'react';
import { DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';

const TermsOfUse = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        {/* Header */}
        <div className="policy-header">
          <div className="policy-icon">
            <DocumentTextIcon />
          </div>
          <h1 className="policy-title">Kullanım Şartları</h1>
          <p className="policy-subtitle">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>

        {/* Content */}
        <div className="policy-card">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Giriş</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu Kullanım Şartları ("Şartlar"), Qnnect hizmetini ("Hizmet") kullanırken geçerlidir. 
              Hizmeti kullanarak, bu şartları kabul etmiş olursunuz. Eğer bu şartları kabul etmiyorsanız, 
              lütfen hizmeti kullanmayın.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hizmet Açıklaması</h2>
            <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
              <p className="text-indigo-800 leading-relaxed">
                Qnnect, öğretim elemanları ve öğrenciler için tasarlanmış modern bir randevu yönetim sistemidir. 
                Hizmetimiz şunları içerir:
              </p>
              <ul className="list-disc list-inside text-indigo-700 space-y-1 mt-3">
                <li>QR kod tabanlı randevu oluşturma ve yönetimi</li>
                <li>Google Calendar entegrasyonu</li>
                <li>Müsaitlik takvimi yönetimi</li>
                <li>Bildirim sistemi</li>
                <li>Kullanıcı profil yönetimi</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kullanıcı Hesapları</h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Hesap Oluşturma
                </h3>
                <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                  <li>Geçerli bir e-posta adresi ile kayıt olmalısınız</li>
                  <li>Güçlü bir şifre seçmelisiniz</li>
                  <li>Doğru ve güncel bilgiler vermelisiniz</li>
                  <li>Hesabınızı güvenli tutmalısınız</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  Yasaklanan Davranışlar
                </h3>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>Sahte bilgiler vermek</li>
                  <li>Başkalarının hesabını kullanmak</li>
                  <li>Hesap bilgilerini paylaşmak</li>
                  <li>Hizmeti kötüye kullanmak</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kabul Edilebilir Kullanım</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-900 mb-2">İzin Verilen Kullanım</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>Eğitim amaçlı randevu oluşturma</li>
                  <li>Profesyonel iletişim kurma</li>
                  <li>Takvim entegrasyonu</li>
                  <li>Hizmet özelliklerini keşfetme</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-semibold text-orange-900 mb-2">Yasaklanan Kullanım</h3>
                <ul className="list-disc list-inside text-orange-700 space-y-1 text-sm">
                  <li>Spam veya istenmeyen içerik</li>
                  <li>Yasa dışı faaliyetler</li>
                  <li>Başkalarını rahatsız etme</li>
                  <li>Sistemi aşırı yükleme</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gizlilik ve Veri</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Veri toplama ve kullanımımız hakkında detaylı bilgi için lütfen 
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-800 font-medium"> Gizlilik Politikamızı</a> inceleyin.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Veri Kullanımı</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>Hizmet kalitesini artırmak için veri toplarız</li>
                <li>Kişisel verilerinizi üçüncü taraflarla paylaşmayız</li>
                <li>Verilerinizi güvenli şekilde saklarız</li>
                <li>KVKK ve GDPR uyumluluğunu sağlarız</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Fikri Mülkiyet</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Qnnect hizmeti ve tüm içeriği, Qnnect'e aittir ve telif hakkı, ticari marka ve 
                diğer fikri mülkiyet yasaları ile korunmaktadır.
              </p>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-yellow-900 mb-2">Kullanıcı İçeriği</h3>
                <p className="text-yellow-800 text-sm">
                  Hizmet üzerinde oluşturduğunuz içerik (randevular, notlar vb.) size aittir. 
                  Ancak, bu içeriği hizmet üzerinde gösterme ve işleme hakkını bize verirsiniz.
                </p>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hizmet Kullanılabilirliği</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Hizmetimizi 7/24 kullanılabilir tutmaya çalışıyoruz, ancak aşağıdaki durumlar nedeniyle 
                kesintiler yaşanabilir:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Planlı Kesintiler</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Sistem güncellemeleri</li>
                    <li>Bakım işlemleri</li>
                    <li>Yeni özellik ekleme</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Planlanmamış Kesintiler</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Teknik sorunlar</li>
                    <li>Sunucu arızaları</li>
                    <li>İnternet kesintileri</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sorumluluk Sınırlaması</h2>
            <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                Önemli Uyarı
              </h3>
              <p className="text-red-800 leading-relaxed mb-4">
                Qnnect, hizmetin kesintisiz veya hatasız olacağını garanti etmez. Hizmet "olduğu gibi" 
                sunulur ve herhangi bir zarar veya kayıp için sorumluluk kabul etmeyiz.
              </p>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-red-900 mb-2">Sorumluluk Kapsamı Dışında:</h4>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>Dolaylı zararlar</li>
                  <li>Veri kayıpları</li>
                  <li>İş kesintileri</li>
                  <li>Üçüncü taraf hizmetler</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hizmet Sonlandırma</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Aşağıdaki durumlarda hizmetinizi sonlandırabiliriz:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Kullanıcı Tarafından</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Hesap silme talebi</li>
                    <li>Uzun süreli inaktivite</li>
                    <li>Şartları ihlal etme</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Bizim Tarafımızdan</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Şart ihlali</li>
                    <li>Yasa dışı kullanım</li>
                    <li>Hizmet sonlandırma</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Şartlarda Değişiklik</h2>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800 leading-relaxed mb-4">
                Bu kullanım şartlarını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda, 
                kullanıcılarımızı e-posta ile bilgilendireceğiz.
              </p>
              <p className="text-blue-800 text-sm">
                <strong>Önemli:</strong> Güncellenmiş şartları kabul etmiyorsanız, hizmeti kullanmayı 
                durdurmanız gerekir. Hizmeti kullanmaya devam etmeniz, güncellenmiş şartları kabul 
                ettiğiniz anlamına gelir.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Uygulanan Hukuk</h2>
            <p className="text-gray-700 leading-relaxed">
              Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir uyuşmazlık 
              durumunda, İstanbul Mahkemeleri ve İcra Müdürlükleri yetkilidir.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-indigo-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim</h2>
            <p className="text-gray-700 mb-4">
              Bu kullanım şartları hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>E-posta:</strong> infoqrcal@gmail.com
              </p>
              <p className="text-gray-700">
                <strong>Adres:</strong> Ankara, Türkiye
              </p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kabul</h2>
            <p className="text-green-800 leading-relaxed">
              Hizmetimizi kullanarak, bu kullanım şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi 
              onaylarsınız. Eğer bu şartları kabul etmiyorsanız, lütfen hizmeti kullanmayın.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
