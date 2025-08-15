import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { 
  AcademicCapIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFacultyList();
      
      if (response.success) {
        setFaculty(response.data || []);
        
        // Extract unique departments
        const uniqueDepartments = [...new Set((response.data || []).map(f => f.department))];
        setDepartments(uniqueDepartments);
      } else {
        console.error('Faculty list response error:', response.message);
        setFaculty([]);
      }
    } catch (error) {
      console.error('Öğretim elemanları yüklenirken hata:', error);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || f.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAppointmentClick = (facultySlug) => {
    window.location.href = `/appointment/${facultySlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Öğretim Elemanları</h1>
            <p className="mt-1 text-sm text-gray-500">
              Randevu almak istediğiniz öğretim elemanını seçin
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Öğretim elemanı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Tüm Bölümler</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-500">
                  {filteredFaculty.length} öğretim elemanı bulundu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Grid */}
        {filteredFaculty.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Öğretim elemanı bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinizi değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((facultyMember) => (
              <div key={facultyMember._id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  {/* Faculty Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      {facultyMember.picture ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={facultyMember.picture}
                          alt={facultyMember.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {facultyMember.title} {facultyMember.name}
                      </h3>
                      <p className="text-sm text-gray-500">{facultyMember.department}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {facultyMember.office && (
                      <div className="flex items-center text-sm text-gray-500">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {facultyMember.office}
                      </div>
                    )}
                    {facultyMember.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {facultyMember.phone}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {facultyMember.email}
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className="mb-4">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${facultyMember.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-gray-500">
                        {facultyMember.isActive ? 'Randevu almaya açık' : 'Şu anda randevu almıyor'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAppointmentClick(facultyMember.slug)}
                    disabled={!facultyMember.isActive}
                    className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      facultyMember.isActive
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {facultyMember.isActive ? 'Randevu Al' : 'Randevu Almıyor'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyList; 