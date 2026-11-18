/**
 * Calculate business/working days between two dates, excluding Saturdays and Sundays.
 * Inclusive of start and end dates.
 */
function calculateWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set both to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return 0;
  }

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Normalize date to UTC/local midnight for consistent single-day queries.
 */
function normalizeDate(dateInput = new Date()) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

/**
 * Calculate difference in hours between two Date objects.
 */
function calculateHoursWorked(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const inTime = new Date(checkIn).getTime();
  const outTime = new Date(checkOut).getTime();
  if (outTime <= inTime) return 0;
  
  const diffMs = outTime - inTime;
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // 2 decimal places
}

/**
 * Determine attendance status based on hours worked.
 */
function determineAttendanceStatus(hoursWorked, onLeave = false) {
  if (onLeave) return 'On Leave';
  if (hoursWorked >= 6) return 'Present';
  if (hoursWorked >= 3) return 'Half Day';
  return 'Absent';
}

module.exports = {
  calculateWorkingDays,
  normalizeDate,
  calculateHoursWorked,
  determineAttendanceStatus,
};
