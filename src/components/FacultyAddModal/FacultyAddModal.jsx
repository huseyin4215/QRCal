import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './FacultyAddModal.module.css';

export default function FacultyAddModal({
  isOpen,
  onClose,
  facultyData,
  onInputChange,
  onSubmit,
  loading,
  error,
  success,
  isEditMode = false,
  editingUser = null
}) {
  if (!isOpen) return null;

                         return (
             <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
               <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditMode ? 'Öğretim Üyesi Düzenle' : 'Yeni Öğretim Üyesi Ekle'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-700 whitespace-pre-line">
                {success}
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={facultyData.name || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Dr. Ahmet Yılmaz"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresi *
                {isEditMode && <span className="text-xs text-gray-500 ml-2">(Düzenlenemez)</span>}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                readOnly={isEditMode}
                value={facultyData.email || ''}
                onChange={onInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="ahmet.yilmaz@universite.edu.tr"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Ünvan *
              </label>
              <select
                id="title"
                name="title"
                required
                value={facultyData.title || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Ünvan seçin</option>
                <option value="Prof. Dr.">Prof. Dr.</option>
                <option value="Doç. Dr.">Doç. Dr.</option>
                <option value="Dr. Öğr. Üyesi">Dr. Öğr. Üyesi</option>
                <option value="Öğr. Gör. Dr.">Öğr. Gör. Dr.</option>
                <option value="Öğr. Gör.">Öğr. Gör.</option>
                <option value="Arş. Gör. Dr.">Arş. Gör. Dr.</option>
                <option value="Arş. Gör.">Arş. Gör.</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Bölüm *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                required
                value={facultyData.department || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Bilgisayar Mühendisliği"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Cep Telefonu
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={facultyData.phone || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0532 123 45 67"
              />
            </div>

            <div>
              <label htmlFor="office" className="block text-sm font-medium text-gray-700 mb-1">
                Ofis
              </label>
              <input
                type="text"
                id="office"
                name="office"
                value={facultyData.office || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: A Blok, 3. Kat, 305"
              />
            </div>

            <div className={styles.buttonContainer}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading
                  ? (isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...')
                  : (isEditMode ? 'Öğretim Üyesi Güncelle' : 'Öğretim Üyesi Ekle')
                }
              </button>
            </div>
          </form>

          {!isEditMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Not:</strong> Öğretim üyesi oluşturulduktan sonra, ilk girişte Google hesabı ile bağlantı kurması gerekecektir.
                Bu sayede Google Calendar entegrasyonu aktif olacak ve QR kod oluşturulabilecektir.
              </p>
            </div>
          )}

          {isEditMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Not:</strong> E-posta adresi güvenlik nedeniyle düzenlenemez. Diğer bilgiler başarıyla güncellenecektir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 