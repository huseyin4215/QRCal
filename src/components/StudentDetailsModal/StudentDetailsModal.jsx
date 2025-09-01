import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';
import styles from './StudentDetailsModal.module.css';

export default function StudentDetailsModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Belirtilmemiş';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-0 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <div className={styles.iconContainer}>
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={styles.headerTitle}>Öğrenci Bilgileri</h3>
                  <p className={styles.headerSubtitle}>Detaylı öğrenci profili</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={styles.closeButton}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">Öğrenci</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{student.email}</span>
                  </div>
                  {student.studentNumber && (
                    <div className="flex items-center space-x-2 text-sm">
                      <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Öğrenci No: {student.studentNumber}</span>
                    </div>
                  )}
                  {student.department && (
                    <div className="flex items-center space-x-2 text-sm">
                      <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{student.department}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <PhoneIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    student.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      student.isActive ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    {student.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Durum</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <ClockIcon className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Kayıt Tarihi</p>
                  <p className="text-xs font-medium text-gray-800">{formatDate(student.createdAt)}</p>
                </div>
              </div>

              {/* Additional Info */}
              {(student.updatedAt && student.updatedAt !== student.createdAt) && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>Son güncelleme: {formatDate(student.updatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              onClick={onClose}
              className={styles.closeButtonFooter}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
