import React from 'react';
import { DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
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
          <h1 className="policy-title">Terms of Service / Kullanım Şartları</h1>
          <p className="policy-subtitle">Last updated / Son güncelleme: 19.02.2026</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Qnnect — Ankara University Appointment Management System
          </p>
        </div>

        {/* Content */}
        <div className="policy-card">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction / Giriş</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your use of Qnnect ("Service"), an appointment
              management system developed at Ankara University, Faculty of Engineering. By using the
              Service, you agree to these Terms. If you do not agree, please do not use the Service.
            </p>
            <p className="text-gray-700 leading-relaxed" style={{ marginTop: '0.5rem' }}>
              Bu Kullanım Şartları, Qnnect hizmetini kullanırken geçerlidir.
              Hizmeti kullanarak bu şartları kabul etmiş olursunuz.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description / Hizmet Açıklaması</h2>
            <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
              <p className="text-indigo-800 leading-relaxed">
                Qnnect is a web-based appointment management platform that enables faculty members and
                students at Ankara University to schedule, manage, and track appointments. Key features include:
              </p>
              <ul className="list-disc list-inside text-indigo-700 space-y-1 mt-3">
                <li>QR code-based appointment booking and management</li>
                <li>Google Calendar integration for automatic event synchronization</li>
                <li>Faculty availability calendar management</li>
                <li>Email notification system for appointment updates</li>
                <li>User profile and department management</li>
                <li>Admin dashboard for system administration</li>
              </ul>
            </div>
          </section>

          {/* Google Calendar Integration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDaysIcon style={{ width: '1.5rem', height: '1.5rem' }} />
              Google Calendar Integration
            </h2>
            <div style={{ background: '#EEF2FF', padding: '1.5rem', borderRadius: '0.75rem', border: '2px solid #818CF8', marginBottom: '1rem' }}>
              <p style={{ color: '#3730A3', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                Qnnect integrates with Google Calendar to provide seamless appointment management.
                By connecting your Google account, you authorize Qnnect to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: '#3730A3', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Create calendar events</strong> when appointments are booked through Qnnect
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Update calendar events</strong> when appointment details are modified
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Delete calendar events</strong> when appointments are cancelled
                </li>
              </ul>
              <p style={{ color: '#3730A3', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                You can disconnect Google Calendar integration at any time from your account settings or by
                revoking access at{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', fontWeight: '600' }}>
                  Google Account Permissions
                </a>.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              Qnnect's use and transfer of information received from Google APIs adheres to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank" rel="noopener noreferrer" style={{ color: '#1D3F87', textDecoration: 'underline' }}>
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts / Kullanıcı Hesapları</h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  Account Requirements / Hesap Gereksinimleri
                </h3>
                <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                  <li>You must register with a valid email address (Geçerli e-posta ile kayıt)</li>
                  <li>You must provide accurate and current information (Doğru ve güncel bilgi)</li>
                  <li>You are responsible for maintaining account security (Hesap güvenliği sizin sorumluluğunuzda)</li>
                  <li>You must not share your credentials (Giriş bilgilerinizi paylaşmamalısınız)</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  Prohibited Activities / Yasaklanan Davranışlar
                </h3>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>Providing false information (Sahte bilgi vermek)</li>
                  <li>Using another person's account (Başkasının hesabını kullanmak)</li>
                  <li>Attempting to access unauthorized data (Yetkisiz verilere erişim)</li>
                  <li>Disrupting or overloading the service (Hizmeti aksatmak veya aşırı yüklemek)</li>
                  <li>Using the service for spam or illegal activities (Spam veya yasa dışı faaliyetler)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use / Kabul Edilebilir Kullanım</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-900 mb-2">Permitted Use / İzin Verilen</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>Scheduling academic appointments (Akademik randevu oluşturma)</li>
                  <li>Managing faculty availability (Müsaitlik takvimi yönetimi)</li>
                  <li>Using Google Calendar sync (Google Takvim senkronizasyonu)</li>
                  <li>Generating and sharing QR codes (QR kod oluşturma ve paylaşma)</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-semibold text-orange-900 mb-2">Prohibited Use / Yasaklanan</h3>
                <ul className="list-disc list-inside text-orange-700 space-y-1 text-sm">
                  <li>Spam or unsolicited messages (Spam veya istenmeyen içerik)</li>
                  <li>Reverse engineering the service (Hizmeti tersine mühendislik)</li>
                  <li>Automated scraping or data collection (Otomatik veri toplama)</li>
                  <li>Any illegal activities (Yasa dışı faaliyetler)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy / Gizlilik</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Our data collection and usage practices are described in detail in our{' '}
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-800 font-medium">Privacy Policy</a>.
              By using the Service, you consent to the data practices described therein.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>We collect only data necessary for the service to function</li>
                <li>We do not sell your personal data to third parties</li>
                <li>Google API data usage complies with Google's Limited Use requirements</li>
                <li>We comply with KVKK (Turkish Data Protection Law) and GDPR</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property / Fikri Mülkiyet</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Qnnect and all its content, features, and functionality are developed as an academic project
                at Ankara University, Faculty of Engineering, and are protected by applicable intellectual property laws.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-yellow-900 mb-2">User Content / Kullanıcı İçeriği</h3>
                <p className="text-yellow-800 text-sm">
                  Content you create through the service (appointments, notes, etc.) remains yours.
                  You grant Qnnect a limited license to display and process this content within the service.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability / Sorumluluk Sınırlaması</h2>
            <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                Disclaimer
              </h3>
              <p className="text-red-800 leading-relaxed mb-4">
                The Service is provided "AS IS" without warranties of any kind. Qnnect is an academic project
                and does not guarantee uninterrupted or error-free service. We are not liable for any indirect,
                incidental, or consequential damages arising from your use of the Service.
              </p>
              <p className="text-red-800 leading-relaxed text-sm">
                Qnnect, hizmetin kesintisiz veya hatasız olacağını garanti etmez. Hizmet "olduğu gibi"
                sunulur. Bu bir üniversite projesidir.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination / Hizmet Sonlandırma</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your access to the Service if you violate these Terms.
              You may delete your account at any time. Upon termination:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>Your account data will be deleted from our servers</li>
              <li>Google Calendar events created by Qnnect will remain in your calendar unless manually deleted</li>
              <li>Google OAuth tokens will be revoked and deleted</li>
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms / Şartlarda Değişiklik</h2>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800 leading-relaxed">
                We may update these Terms from time to time. The current version is always available at{' '}
                <a href="https://qrnnect.com/terms" style={{ color: '#1E40AF', textDecoration: 'underline' }}>
                  https://qrnnect.com/terms
                </a>.
                Continued use of the Service after changes constitutes acceptance of the updated Terms.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law / Uygulanan Hukuk</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of the Republic of Turkey. Any disputes shall be
              resolved in the courts of Ankara, Turkey.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-indigo-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact / İletişim</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> infoqrcal@gmail.com
              </p>
              <p className="text-gray-700">
                <strong>Project:</strong> Ankara University — Faculty of Engineering
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> Ankara Üniversitesi, Gölbaşı Kampüsü, Ankara, Türkiye
              </p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance / Kabul</h2>
            <p className="text-green-800 leading-relaxed">
              By using Qnnect, you acknowledge that you have read, understood, and agree to these
              Terms of Service and our{' '}
              <a href="/privacy" className="text-green-900 font-semibold underline">Privacy Policy</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
