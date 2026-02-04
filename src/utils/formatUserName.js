/**
 * Formats user name with title prefix for faculty/admin
 * @param {Object} user - User object with name and optional title
 * @param {string} user.name - User's name
 * @param {string} user.title - User's title (optional, for faculty/admin)
 * @returns {string} Formatted name with title prefix if available
 */
export const formatUserName = (user) => {
  if (!user) return '';
  
  const name = user.name || '';
  const title = user.title || '';
  
  // Only add title for faculty and admin roles
  if ((user.role === 'faculty' || user.role === 'admin') && title) {
    return `${title} ${name}`.trim();
  }
  
  return name;
};

/**
 * Formats faculty name with title from appointment data
 * @param {Object} appointment - Appointment object
 * @returns {string} Formatted faculty name with title
 */
export const formatFacultyName = (appointment) => {
  if (!appointment) return '';
  
  // Check if facultyId is populated (backend uses facultyId, not faculty)
  const faculty = appointment.facultyId || appointment.faculty;
  
  // If faculty object has title and name, use it
  if (faculty?.title && faculty?.name) {
    return `${faculty.title} ${faculty.name}`;
  }
  
  // If facultyName already includes title (from backend), use it
  if (appointment.facultyName) {
    // Check if facultyName already has title (contains common titles)
    const hasTitle = /^(Prof\.|Doç\.|Dr\.|Öğr\.Gör\.|Arş\.Gör\.)/i.test(appointment.facultyName);
    if (hasTitle) {
      return appointment.facultyName;
    }
    
    // If facultyName doesn't have title but we have faculty object with title, add it
    if (faculty?.title && faculty?.name) {
      return `${faculty.title} ${appointment.facultyName}`;
    }
    
    return appointment.facultyName;
  }
  
  // Fallback to just name from faculty object
  if (faculty?.name) {
    return faculty.name;
  }
  
  return '';
};

/**
 * Formats student name (students don't have titles)
 * @param {Object} appointment - Appointment object
 * @returns {string} Student name
 */
export const formatStudentName = (appointment) => {
  if (!appointment) return '';
  
  return appointment.student?.name || appointment.studentName || '';
};

export default formatUserName;

