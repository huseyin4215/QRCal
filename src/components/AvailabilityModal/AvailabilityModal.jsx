import { XMarkIcon, PlusIcon, TrashIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import styles from './AvailabilityModal.module.css';

export default function AvailabilityModal({ 
  isOpen, 
  onClose, 
  availability, 
  onDayAvailabilityChange,
  onSave,
  onLoadFromGoogleCalendar,
  loading, 
  error, 
  success 
}) {
  // Map English day names to Turkish for display
  const getDayDisplayName = (englishDay) => {
    const dayMap = {
      'Monday': 'Pazartesi',
      'Tuesday': 'Salı',
      'Wednesday': 'Çarşamba',
      'Thursday': 'Perşembe',
      'Friday': 'Cuma',
      'Saturday': 'Cumartesi',
      'Sunday': 'Pazar'
    };
    return dayMap[englishDay] || englishDay;
  };

  // Add new time slot to a day
  const addTimeSlot = (dayIndex) => {
    const newSlot = {
      start: '09:00',
      end: '10:00',
      isAvailable: true,
      manuallyUnavailable: false,
      hasConflict: false,
      conflictReason: null
    };

    onDayAvailabilityChange(dayIndex, 'timeSlots', [
      ...(availability[dayIndex].timeSlots || []),
      newSlot
    ]);
  };

  // Remove time slot from a day
  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedSlots = availability[dayIndex].timeSlots.filter((_, index) => index !== slotIndex);
    onDayAvailabilityChange(dayIndex, 'timeSlots', updatedSlots);
  };

  // Update time slot
  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const updatedSlots = [...(availability[dayIndex].timeSlots || [])];
    const currentSlot = updatedSlots[slotIndex];

    // Track manual unavailability
    if (field === 'isAvailable' && value === false) {
      updatedSlots[slotIndex] = {
        ...currentSlot,
        [field]: value,
        manuallyUnavailable: true
      };
    } else if (field === 'isAvailable' && value === true) {
      updatedSlots[slotIndex] = {
        ...currentSlot,
        [field]: value,
        manuallyUnavailable: false
      };
    } else {
      updatedSlots[slotIndex] = { ...currentSlot, [field]: value };
    }

    onDayAvailabilityChange(dayIndex, 'timeSlots', updatedSlots);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-6 border w-full max-w-5xl shadow-2xl rounded-2xl bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Haftalık Müsaitlik Ayarları</h3>
                <p className="text-sm text-gray-500">Çalışma saatlerinizi ve müsaitlik durumunuzu yönetin</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-600 font-medium">{success}</p>
            </div>
          )}



          {/* Day Availability Management */}
          <div className="space-y-6">
            {availability.map((day, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={day.isActive}
                        onChange={(e) => onDayAvailabilityChange(dayIndex, 'isActive', e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg transition-all duration-200"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{getDayDisplayName(day.day)}</h4>
                      <p className="text-sm text-gray-500">
                        {day.isActive ? 'Aktif' : 'Pasif'}
                      </p>
                    </div>
                  </div>
                  {day.isActive && (
                    <button
                      onClick={() => addTimeSlot(dayIndex)}
                      className={styles.addTimeButton}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Zaman Aralığı Ekle
                    </button>
                  )}
                </div>

                {day.isActive && (
                  <div className="space-y-4">
                    {(day.timeSlots || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                        <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 font-medium">Henüz zaman aralığı eklenmemiş</p>
                        <button
                          onClick={() => addTimeSlot(dayIndex)}
                          className="mt-3 text-blue-600 hover:text-blue-800 font-medium underline transition-colors duration-200"
                        >
                          İlk zaman aralığını ekle
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(day.timeSlots || []).map((slot, slotIndex) => (
                          <div key={slotIndex} className={`${styles.timeSlotRow} ${
                            slot.hasConflict 
                              ? 'bg-red-50 border-red-200' 
                              : ''
                          }`}>
                            <div className={styles.timeInputGroup}>
                              <label className={styles.timeInputLabel}>Başlangıç:</label>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                                className={styles.timeInput}
                              />
                            </div>
                            <div className={styles.timeInputGroup}>
                              <label className={styles.timeInputLabel}>Bitiş:</label>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                                className={styles.timeInput}
                              />
                            </div>
                            <div className={styles.availabilityGroup}>
                              <input
                                type="checkbox"
                                checked={slot.isAvailable}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'isAvailable', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                              />
                              <label className={styles.timeInputLabel}>Müsait</label>
                            </div>
                            
                            {/* Conflict indicator */}
                            {slot.hasConflict && (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span>Çakışma</span>
                              </div>
                            )}
                            
                            <button
                              onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                              className={styles.deleteButton}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            {typeof onLoadFromGoogleCalendar === 'function' && (
              <button
                onClick={onLoadFromGoogleCalendar}
                className={styles.googleCalendarButton}
                disabled={loading}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Google Calendar'dan Yükle
              </button>
            )}
            <button
              onClick={onSave}
              className={styles.saveButton}
              disabled={loading}
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={onClose}
              className={styles.closeButton2}
              disabled={loading}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 