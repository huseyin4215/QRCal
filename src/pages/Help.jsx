import React, { useState } from 'react';
import { QuestionMarkCircleIcon, BookOpenIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import '../styles/policy-pages.css';

const Help = () => {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "QR Calendar nedir ve nasıl çalışır?",
      answer: "QR Calendar, öğretim elemanları ve öğrenciler için tasarlanmış modern bir randevu yönetim sistemidir. QR kod teknolojisi kullanarak hızlı ve kolay randevu alma deneyimi sunar. Öğretim elemanları müsaitlik takvimlerini oluşturur, öğrenciler ise bu takvimlerden uygun zamanları seçerek randevu alabilir."
    },
    {
      question: "Hesap oluşturmak için ne yapmam gerekiyor?",
      answer: "Hesap oluşturmak için ana sayfadaki 'Kayıt Ol' butonuna tıklayın. Geçerli bir e-posta adresi, ad-soyad ve güçlü bir şifre girmeniz gerekiyor. Kayıt olduktan sonra e-posta adresinize gelen doğrulama linkine tıklayarak hesabınızı aktifleştirebilirsiniz."
    },
    {
      question: "Şifremi unuttum, ne yapabilirim?",
      answer: "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayarak şifre sıfırlama işlemi başlatabilirsiniz. E-posta adresinize şifre sıfırlama linki gönderilecektir. Bu linke tıklayarak yeni bir şifre belirleyebilirsiniz."
    },
    {
      question: "QR kod nasıl oluşturulur?",
      answer: "QR kod oluşturmak için öğretim elemanı hesabıyla giriş yapın ve 'QR Kod Oluştur' sayfasına gidin. Randevu türü, süre ve müsaitlik zamanlarını belirleyin. Sistem otomatik olarak QR kod oluşturacak ve bunu yazdırabilir veya dijital olarak paylaşabilirsiniz."
    },
    {
      question: "Randevu nasıl alınır?",
      answer: "Randevu almak için öğrenci hesabıyla giriş yapın. Öğretim elemanının QR kodunu tarayın veya profil sayfasından müsaitlik takvimini görüntüleyin. Uygun zaman dilimini seçin ve randevu detaylarını doldurarak onaylayın."
    },
    {
      question: "Google Calendar entegrasyonu nasıl çalışır?",
      answer: "Google Calendar entegrasyonu için önce Google hesabınızla giriş yapmanız gerekiyor. 'Takvim Entegrasyonu' sayfasından Google Calendar'a bağlanın. Bu sayede QR Calendar'daki randevularınız otomatik olarak Google Calendar'ınıza da eklenir."
    },
    {
      question: "Randevu iptal edilebilir mi?",
      answer: "Evet, randevular iptal edilebilir. Randevu detayları sayfasından 'İptal Et' butonuna tıklayarak randevuyu iptal edebilirsiniz. İptal işlemi geri alınamaz, bu yüzden dikkatli olun."
    },
    {
      question: "Müsaitlik takvimi nasıl güncellenir?",
      answer: "Müsaitlik takvimini güncellemek için öğretim elemanı hesabıyla giriş yapın. 'Müsaitlik Takvimi' sayfasından yeni zaman dilimleri ekleyebilir, mevcut olanları düzenleyebilir veya silebilirsiniz. Değişiklikler anında yansır."
    },
    {
      question: "Bildirimler nasıl alınır?",
      answer: "Bildirimler otomatik olarak e-posta ile gönderilir. Randevu onaylandığında, iptal edildiğinde veya hatırlatma zamanı geldiğinde bildirim alırsınız. Bildirim tercihlerinizi profil ayarlarından düzenleyebilirsiniz."
    },
    {
      question: "Teknik sorun yaşıyorum, ne yapmalıyım?",
      answer: "Teknik sorunlar için önce tarayıcınızı yenileyin ve çerezleri temizleyin. Sorun devam ederse, destek ekibimizle iletişime geçin. E-posta, telefon veya canlı destek üzerinden yardım alabilirsiniz."
    }
  ];

  const gettingStartedSteps = [
    {
      step: 1,
      title: "Hesap Oluşturma",
      description: "E-posta adresinizle kayıt olun ve hesabınızı doğrulayın.",
      icon: "👤"
    },
    {
      step: 2,
      title: "Profil Tamamlama",
      description: "Kişisel bilgilerinizi ve tercihlerinizi güncelleyin.",
      icon: "⚙️"
    },
    {
      step: 3,
      title: "QR Kod Oluşturma",
      description: "Öğretim elemanları için: Randevu QR kodları oluşturun.",
      icon: "📱"
    },
    {
      step: 4,
      title: "Randevu Yönetimi",
      description: "Randevuları oluşturun, düzenleyin ve takip edin.",
      icon: "📅"
    },
    {
      step: 5,
      title: "Takvim Entegrasyonu",
      description: "Google Calendar ile senkronize edin.",
      icon: "🔗"
    }
  ];

  const features = [
    {
      title: "QR Kod Teknolojisi",
      description: "Hızlı ve kolay randevu alma deneyimi",
      icon: "📱"
    },
    {
      title: "Google Calendar Entegrasyonu",
      description: "Mevcut takvimlerinizle senkronizasyon",
      icon: "📅"
    },
    {
      title: "Gerçek Zamanlı Bildirimler",
      description: "Anlık güncellemeler ve hatırlatmalar",
      icon: "🔔"
    },
    {
      title: "Mobil Uyumlu",
      description: "Tüm cihazlarda mükemmel deneyim",
      icon: "📱"
    },
    {
      title: "Güvenli Veri Saklama",
      description: "KVKK ve GDPR uyumlu güvenlik",
      icon: "🔒"
    },
    {
      title: "Çoklu Kullanıcı Desteği",
      description: "Öğrenci, öğretim elemanı ve admin rolleri",
      icon: "👥"
    }
  ];

  return (
    <div className="policy-container">
      <div className="policy-content">
        {/* Header */}
        <div className="policy-header">
          <div className="policy-icon">
            <QuestionMarkCircleIcon />
          </div>
          <h1 className="policy-title">Yardım Merkezi</h1>
          <p className="policy-subtitle">QR Calendar kullanımı hakkında tüm bilgilere buradan ulaşabilirsiniz</p>
        </div>

        {/* Tab Navigation */}
        <div className="policy-tabs">
          <div className="policy-tab-nav">
            {[
              { id: 'getting-started', name: 'Başlangıç Rehberi', icon: BookOpenIcon },
              { id: 'faq', name: 'Sık Sorulan Sorular', icon: QuestionMarkCircleIcon },
              { id: 'features', name: 'Özellikler', icon: LightBulbIcon },
              { id: 'support', name: 'Destek', icon: ChatBubbleLeftRightIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`policy-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="policy-tab-content">
            {/* Getting Started Tab */}
            {activeTab === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Başlangıç Rehberi</h2>
                  <p className="text-gray-700 mb-6">
                    QR Calendar'ı kullanmaya başlamak için aşağıdaki adımları takip edin:
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gettingStartedSteps.map((step) => (
                      <div key={step.step} className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">{step.icon}</span>
                          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {step.step}
                          </div>
                        </div>
                        <h3 className="font-semibold text-blue-900 mb-2">{step.title}</h3>
                        <p className="text-blue-700 text-sm">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-yellow-900 mb-3">💡 İpucu</h3>
                  <p className="text-yellow-800">
                    İlk kez kullanıyorsanız, demo hesabı ile sistemi deneyebilirsiniz. 
                    Bu sayede tüm özellikleri güvenli bir şekilde keşfedebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sık Sorulan Sorular</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <span className={`transform transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                      {openFaq === index && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Özellikler</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Destek Kanalları</h2>
                  <p className="text-gray-700 mb-6">
                    Size yardımcı olmak için buradayız. Aşağıdaki kanallardan birini kullanarak bizimle iletişime geçebilirsiniz:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center mb-3">
                        <EnvelopeIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <h3 className="text-xl font-semibold text-blue-900">E-posta Desteği</h3>
                      </div>
                      <p className="text-blue-800 mb-3">
                        Detaylı sorularınız için e-posta ile destek alın.
                      </p>
                      <p className="text-blue-700 font-medium">support@qrcalendar.com</p>
                      <p className="text-blue-600 text-sm">Yanıt süresi: 24 saat</p>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center mb-3">
                        <PhoneIcon className="h-8 w-8 text-green-600 mr-3" />
                        <h3 className="text-xl font-semibold text-green-900">Telefon Desteği</h3>
                      </div>
                      <p className="text-green-800 mb-3">
                        Acil durumlar için telefon ile destek alın.
                      </p>
                      <p className="text-green-700 font-medium">+90 (212) 555 0123</p>
                      <p className="text-green-600 text-sm">Çalışma saatleri: 09:00-18:00</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Canlı Destek</h3>
                  <div className="flex items-center space-x-4">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-gray-700 mb-2">
                        Canlı destek ekibimiz size anında yardımcı olmaya hazır.
                      </p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Canlı Destek Başlat
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-yellow-900 mb-3">📚 Ek Kaynaklar</h3>
                  <div className="space-y-2">
                    <p className="text-yellow-800">
                      <a href="/privacy" className="text-yellow-900 hover:underline font-medium">Gizlilik Politikası</a> - 
                      Veri kullanımı hakkında detaylı bilgi
                    </p>
                    <p className="text-yellow-800">
                      <a href="/terms" className="text-yellow-900 hover:underline font-medium">Kullanım Şartları</a> - 
                      Hizmet kullanım koşulları
                    </p>
                    <p className="text-yellow-800">
                      <a href="/cookies" className="text-yellow-900 hover:underline font-medium">Çerez Politikası</a> - 
                      Çerez kullanımı hakkında bilgi
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
