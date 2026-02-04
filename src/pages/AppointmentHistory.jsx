import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon, AcademicCapIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header/Header';
import apiService from '../services/apiService';
import { exportAppointmentsToPDF } from '../utils/pdfExport';
import { formatUserName, formatFacultyName, formatStudentName } from '../utils/formatUserName';
import headerStyles from '../components/Header/Header.module.css';
import styles from './AppointmentHistory.module.css';

const AppointmentHistory = ({ userId: propUserId, embedded = false, refreshTrigger = 0 }) => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [filter, setFilter] = useState('all'); // all, past, upcoming
  const [searchQuery, setSearchQuery] = useState(''); // Search query

  // Use prop userId if provided (embedded mode), otherwise use param from route
  const userId = propUserId || paramUserId;
  
  useEffect(() => {
    // Initialize userInfo
    if (userId) {
      loadUserInfo();
    } else if (user) {
      // If no userId but we have user context, use it directly
      setUserInfo({
        _id: user._id || user.id,
        name: formatUserName(user),
        email: user.email,
        role: user.role,
        studentNumber: user.studentNumber,
        department: user.department,
        title: user.title
      });
    }
  }, [userId, user]);

  useEffect(() => {
    // Load appointments when userInfo is available or when refreshTrigger changes
    if (userInfo) {
      loadAppointments();
    } else if (user && !userId) {
      // Embedded mode without userId prop - use current user
      setUserInfo({
        _id: user._id || user.id,
        name: formatUserName(user),
        email: user.email,
        role: user.role,
        studentNumber: user.studentNumber,
        department: user.department,
        title: user.title
      });
    }
  }, [userInfo, refreshTrigger]);

  const loadUserInfo = async () => {
    try {
      // If viewing own history, use current user info from context
      if (user && (user._id === userId || user.id === userId || !userId)) {
        setUserInfo({
          _id: user._id || user.id,
          name: formatUserName(user), // Include title for faculty/admin
          email: user.email,
          role: user.role,
          studentNumber: user.studentNumber,
          department: user.department,
          title: user.title // Keep original title for reference
        });
        return;
      }
      
      // Otherwise, fetch from API (for admin/faculty viewing other users)
      if (userId) {
        const response = await apiService.getUserById(userId);
        if (response.success) {
          const userData = response.data;
          setUserInfo({
            ...userData,
            name: formatUserName(userData) // Include title for faculty/admin
          });
        } else {
          throw new Error('User not found');
        }
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      // If API call fails, use context user as fallback
      if (user) {
        setUserInfo({
          _id: user._id || user.id,
          name: formatUserName(user), // Include title for faculty/admin
          email: user.email,
          role: user.role,
          studentNumber: user.studentNumber,
          department: user.department,
          title: user.title // Keep original title for reference
        });
      } else {
        // If no user context, set loading to false to prevent infinite loading
        setLoading(false);
      }
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Determine the actual userId to use
      const actualUserId = userId || user?._id || user?.id;
      
      // For students viewing their own history, use student appointments endpoint
      if (userInfo?.role === 'student' && user && (user._id === actualUserId || user.id === actualUserId || !actualUserId)) {
        try {
          const response = await apiService.getStudentAppointments();
          if (response.success) {
            const appointments = response.data?.appointments || response.data || [];
            const appointmentsArray = Array.isArray(appointments) ? appointments : [];
            setAppointments(appointmentsArray);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Öğrenci randevuları yüklenirken hata:', error);
          setAppointments([]);
          setLoading(false);
          return;
        }
      }
      
      // For faculty viewing their own history, use faculty appointments endpoint
      if (userInfo?.role === 'faculty' && user && (user._id === actualUserId || user.id === actualUserId || !actualUserId)) {
        try {
          const response = await apiService.getFacultyAppointments();
          if (response.success) {
            const appointments = response.data?.appointments || response.data || [];
            const appointmentsArray = Array.isArray(appointments) ? appointments : [];
            setAppointments(appointmentsArray);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Öğretim üyesi randevuları yüklenirken hata:', error);
          setAppointments([]);
          setLoading(false);
          return;
        }
      }
      
      // For admin viewing other users, use admin endpoint
      if (user?.role === 'admin') {
        try {
          const response = await apiService.getAllAppointments();
          if (response.success) {
            // API returns { data: { appointments: [...], pagination: {...} } }
            const appointments = response.data?.appointments || response.data || [];
            
            // Ensure it's an array
            const appointmentsArray = Array.isArray(appointments) ? appointments : [];
            
            // Filter appointments for this user
            const targetUserId = actualUserId || userInfo?._id;
            let userAppointments = appointmentsArray.filter(apt => {
              if (userInfo?.role === 'student') {
                // For students, match by email (since appointments store studentEmail)
                return apt.studentEmail?.toLowerCase() === userInfo.email?.toLowerCase() ||
                       apt.student?._id === targetUserId || 
                       apt.student === targetUserId ||
                       (userInfo.studentNumber && apt.studentId === userInfo.studentNumber);
              } else {
                // For faculty/admin, match by facultyId
                return apt.faculty?._id === targetUserId || 
                       apt.faculty === targetUserId || 
                       apt.facultyId?._id === targetUserId || 
                       apt.facultyId === targetUserId;
              }
            });

            // Sort by date (newest first)
            userAppointments.sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.startTime}`);
              const dateB = new Date(`${b.date}T${b.startTime}`);
              return dateB - dateA;
            });

            setAppointments(userAppointments);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Admin randevuları yüklenirken hata:', error);
          setAppointments([]);
          setLoading(false);
          return;
        }
      }
      
      // If none of the above conditions match, set empty appointments
      setAppointments([]);
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
      completed: 'Tamamlandı',
      no_response: 'Cevaplanmadı'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      pending: styles.statusPending,
      approved: styles.statusApproved,
      rejected: styles.statusRejected,
      cancelled: styles.statusCancelled,
      completed: styles.statusCompleted,
      no_response: styles.statusNoResponse
    };
    return statusClassMap[status] || '';
  };

  const isPastAppointment = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate < now;
  };

  // Filter appointments by date filter and search query
  const filteredAppointments = appointments.filter(apt => {
    // Apply date filter
    if (filter === 'past' && !isPastAppointment(apt)) return false;
    if (filter === 'upcoming' && isPastAppointment(apt)) return false;
    
    // Apply search query if exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchableText = [
        apt.topic?.name || apt.topic || '',
        apt.description || '',
        formatFacultyName(apt) || '', // Use formatFacultyName to include title
        formatStudentName(apt) || '',
        apt.studentEmail || apt.student?.email || '',
        formatDate(apt.date),
        formatTime(apt.startTime),
        formatTime(apt.endTime),
        getStatusText(apt.status),
        apt.rejectionReason || '',
        apt.cancellationReason || ''
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    }
    
    return true;
  });

  const getDashboardRoute = () => {
    if (user?.role === 'admin') return '/admin-dashboard';
    return '/';
  };

  const handleExportPDF = async () => {
    if (filteredAppointments.length === 0) {
      alert('Dışa aktarılacak randevu bulunamadı.');
      return;
    }

    const title = userInfo 
      ? `${userInfo.name} - Randevu Geçmişi${filter !== 'all' ? ` (${filter === 'past' ? 'Geçmiş' : 'Yaklaşan'})` : ''}`
      : 'Randevu Geçmişi';
    
    await exportAppointmentsToPDF(filteredAppointments, title);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-gray-50 flex flex-col`}>
      {!embedded && (
        <Header
          user={user}
          onProfile={() => {}}
          onPassword={() => {}}
          onLogout={() => {}}
        >
          <div className={headerStyles.navigationButtons}>
            <button
              onClick={() => navigate(getDashboardRoute())}
              className={headerStyles.navLink}
            >
              <ArrowLeftIcon className={headerStyles.navIcon} />
              Geri Dön
            </button>
          </div>
        </Header>
      )}

      <div className={`dashboard-main w-full ${embedded ? 'p-0' : 'px-4 sm:px-6 lg:px-8 py-8'} flex-1`}>
        <div className={embedded ? 'w-full' : 'max-w-6xl mx-auto'}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Randevu Geçmişi</h1>
              {userInfo && !embedded && (
                <p className={styles.subtitle}>
                  {userInfo.name} - {userInfo.role === 'student' ? 'Öğrenci' : 'Öğretim Üyesi'}
                </p>
              )}
            </div>
            <button
              onClick={handleExportPDF}
              disabled={filteredAppointments.length === 0}
              className={`${styles.pdfButton} ${filteredAppointments.length === 0 ? styles.pdfButtonDisabled : ''}`}
              title={filteredAppointments.length === 0 ? 'Dışa aktarılacak randevu yok' : 'PDF Olarak İndir'}
            >
              <ArrowDownTrayIcon className={styles.pdfButtonIcon} />
              <span className={styles.pdfButtonText}>PDF İndir</span>
            </button>
          </div>

          {/* Search Box */}
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <MagnifyingGlassIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Randevularda ara (konu, öğrenci, öğretim üyesi, tarih, durum...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={styles.searchClearButton}
                  title="Temizle"
                >
                  <svg className={styles.searchClearIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className={styles.searchResults}>
                {filteredAppointments.length} sonuç bulundu
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          <div className={styles.filterContainer}>
            <button
              onClick={() => setFilter('all')}
              className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            >
              Tümü ({appointments.length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`${styles.filterButton} ${filter === 'past' ? styles.filterButtonActive : ''}`}
            >
              Geçmiş ({appointments.filter(isPastAppointment).length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`${styles.filterButton} ${filter === 'upcoming' ? styles.filterButtonActive : ''}`}
            >
              Yaklaşan ({appointments.filter(a => !isPastAppointment(a)).length})
            </button>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className={styles.emptyState}>
              <CalendarIcon className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Randevu bulunamadı</h3>
              <p className={styles.emptyDescription}>
                {filter === 'all' 
                  ? 'Bu kullanıcı için henüz randevu kaydı bulunmuyor.'
                  : filter === 'past'
                  ? 'Geçmiş randevu bulunmuyor.'
                  : 'Yaklaşan randevu bulunmuyor.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className={styles.tableContainer}>
                <table className={styles.appointmentsTable}>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Saat</th>
                      <th>Konu</th>
                      {userInfo?.role === 'student' ? (
                        <th>Öğretim Üyesi</th>
                      ) : (
                        <th>Öğrenci</th>
                      )}
                      <th>Durum</th>
                      <th>Açıklama</th>
                      <th>Notlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment._id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.dateCell}>
                            <CalendarIcon className={styles.cellIcon} />
                            {formatDate(appointment.date)}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.timeCell}>
                            <ClockIcon className={styles.cellIcon} />
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.topicCell}>
                            {appointment.topic?.name || appointment.topicName || 'Görüşme Talebi'}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          {userInfo?.role === 'student' ? (
                            <div className={styles.userCell}>
                              <AcademicCapIcon className={styles.cellIcon} />
                              {formatFacultyName(appointment) || 'Belirtilmemiş'}
                            </div>
                          ) : (
                            <div className={styles.userCell}>
                              <UserIcon className={styles.cellIcon} />
                              {formatStudentName(appointment) || 'Belirtilmemiş'}
                              {appointment.studentNumber && (
                                <span className={styles.studentNumber}>({appointment.studentNumber})</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          {appointment.description ? (
                            <span className={styles.descriptionCell} title={appointment.description}>
                              {appointment.description.length > 50 
                                ? `${appointment.description.substring(0, 50)}...` 
                                : appointment.description}
                            </span>
                          ) : (
                            <span className={styles.noData}>-</span>
                          )}
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.notesCell}>
                            {appointment.rejectionReason && (
                              <div className={styles.rejectionReason}>
                                <strong>Red:</strong> {appointment.rejectionReason}
                              </div>
                            )}
                            {appointment.cancellationReason && (
                              <div className={styles.cancellationReason}>
                                <strong>İptal:</strong> {appointment.cancellationReason}
                              </div>
                            )}
                            {!appointment.rejectionReason && !appointment.cancellationReason && (
                              <span className={styles.noData}>-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className={styles.mobileCardContainer}>
                {filteredAppointments.map((appointment) => (
                  <div key={appointment._id} className={styles.appointmentCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardHeaderLeft}>
                        <div className={styles.dateIcon}>
                          <CalendarIcon className={styles.icon} />
                        </div>
                        <div>
                          <h3 className={styles.appointmentTitle}>
                            {appointment.topic?.name || appointment.topicName || 'Görüşme Talebi'}
                          </h3>
                          <p className={styles.appointmentDate}>
                            <CalendarIcon className={styles.cellIcon} />
                            {formatDate(appointment.date)}
                            <span style={{ margin: '0 0.5rem' }}>•</span>
                            <ClockIcon className={styles.cellIcon} />
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </p>
                        </div>
                      </div>
                      <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.infoRow}>
                        {userInfo?.role === 'student' ? (
                          <>
                            <AcademicCapIcon className={styles.infoIcon} />
                            <span className={styles.infoLabel}>Öğretim Üyesi:</span>
                            <span className={styles.infoValue}>
                              {formatFacultyName(appointment) || 'Belirtilmemiş'}
                            </span>
                          </>
                        ) : (
                          <>
                            <UserIcon className={styles.infoIcon} />
                            <span className={styles.infoLabel}>Öğrenci:</span>
                            <span className={styles.infoValue}>
                              {formatStudentName(appointment) || 'Belirtilmemiş'}
                              {appointment.studentNumber && (
                                <span className={styles.studentNumber}> ({appointment.studentNumber})</span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                      {appointment.description && (
                        <div className={styles.description}>
                          <p className={styles.descriptionText}>
                            <strong>Açıklama:</strong> {appointment.description}
                          </p>
                        </div>
                      )}
                      {appointment.rejectionReason && (
                        <div className={styles.rejectionReason}>
                          <strong>Red Nedeni:</strong> {appointment.rejectionReason}
                        </div>
                      )}
                      {appointment.cancellationReason && (
                        <div className={styles.cancellationReason}>
                          <strong>İptal Nedeni:</strong> {appointment.cancellationReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;

