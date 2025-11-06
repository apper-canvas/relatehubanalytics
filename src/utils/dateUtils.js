import { format, isAfter, isBefore, isToday, isTomorrow, isThisWeek, parseISO, subDays } from 'date-fns';

/**
 * Validates if a value can be converted to a valid Date
 * @param {any} date - The date value to validate
 * @returns {boolean} - True if the date is valid
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

/**
 * Safely formats a date using date-fns format function
 * @param {any} date - The date to format
 * @param {string} formatStr - The format string
 * @param {string} fallback - Fallback text for invalid dates
 * @returns {string} - Formatted date or fallback
 */
export const safeFormat = (date, formatStr, fallback = 'Invalid date') => {
  try {
    if (!isValidDate(date)) {
      console.warn(`Invalid date provided to safeFormat:`, date);
      return fallback;
    }
    
    const parsedDate = new Date(date);
    return format(parsedDate, formatStr);
  } catch (error) {
    console.error('Error in safeFormat:', error, 'Date:', date);
    return fallback;
  }
};

/**
 * Safely parses an ISO date string
 * @param {string} dateStr - ISO date string
 * @param {Date} fallback - Fallback date for invalid strings
 * @returns {Date} - Parsed date or fallback
 */
export const safeParseISO = (dateStr, fallback = new Date()) => {
  try {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn(`Invalid date string provided to safeParseISO:`, dateStr);
      return fallback;
    }
    
    const parsedDate = parseISO(dateStr);
    if (!isValidDate(parsedDate)) {
      console.warn(`Failed to parse ISO date:`, dateStr);
      return fallback;
    }
    
    return parsedDate;
  } catch (error) {
    console.error('Error in safeParseISO:', error, 'Date string:', dateStr);
    return fallback;
  }
};

/**
 * Safely compares if first date is after second date
 * @param {any} date1 - First date
 * @param {any} date2 - Second date
 * @param {boolean} fallback - Fallback result for invalid dates
 * @returns {boolean} - Comparison result or fallback
 */
export const safeIsAfter = (date1, date2, fallback = false) => {
  try {
    if (!isValidDate(date1) || !isValidDate(date2)) {
      console.warn(`Invalid dates provided to safeIsAfter:`, date1, date2);
      return fallback;
    }
    
    return isAfter(new Date(date1), new Date(date2));
  } catch (error) {
    console.error('Error in safeIsAfter:', error, 'Dates:', date1, date2);
    return fallback;
  }
};

/**
 * Safely compares if first date is before second date
 * @param {any} date1 - First date
 * @param {any} date2 - Second date
 * @param {boolean} fallback - Fallback result for invalid dates
 * @returns {boolean} - Comparison result or fallback
 */
export const safeIsBefore = (date1, date2, fallback = false) => {
  try {
    if (!isValidDate(date1) || !isValidDate(date2)) {
      console.warn(`Invalid dates provided to safeIsBefore:`, date1, date2);
      return fallback;
    }
    
    return isBefore(new Date(date1), new Date(date2));
  } catch (error) {
    console.error('Error in safeIsBefore:', error, 'Dates:', date1, date2);
    return fallback;
  }
};

/**
 * Safely checks if date is today
 * @param {any} date - Date to check
 * @param {boolean} fallback - Fallback result for invalid dates
 * @returns {boolean} - True if date is today or fallback
 */
export const safeIsToday = (date, fallback = false) => {
  try {
    if (!isValidDate(date)) {
      console.warn(`Invalid date provided to safeIsToday:`, date);
      return fallback;
    }
    
    return isToday(new Date(date));
  } catch (error) {
    console.error('Error in safeIsToday:', error, 'Date:', date);
    return fallback;
  }
};

/**
 * Safely checks if date is tomorrow
 * @param {any} date - Date to check
 * @param {boolean} fallback - Fallback result for invalid dates
 * @returns {boolean} - True if date is tomorrow or fallback
 */
export const safeIsTomorrow = (date, fallback = false) => {
  try {
    if (!isValidDate(date)) {
      console.warn(`Invalid date provided to safeIsTomorrow:`, date);
      return fallback;
    }
    
    return isTomorrow(new Date(date));
  } catch (error) {
    console.error('Error in safeIsTomorrow:', error, 'Date:', date);
    return fallback;
  }
};

/**
 * Safely checks if date is this week
 * @param {any} date - Date to check
 * @param {boolean} fallback - Fallback result for invalid dates
 * @returns {boolean} - True if date is this week or fallback
 */
export const safeIsThisWeek = (date, fallback = false) => {
  try {
    if (!isValidDate(date)) {
      console.warn(`Invalid date provided to safeIsThisWeek:`, date);
      return fallback;
    }
    
    return isThisWeek(new Date(date));
  } catch (error) {
    console.error('Error in safeIsThisWeek:', error, 'Date:', date);
    return fallback;
  }
};

/**
 * Safely creates an ISO string from a date
 * @param {any} date - Date to convert
 * @param {string} fallback - Fallback string for invalid dates
 * @returns {string} - ISO string or fallback
 */
export const safeToISOString = (date = new Date(), fallback = new Date().toISOString()) => {
  try {
    if (!isValidDate(date)) {
      console.warn(`Invalid date provided to safeToISOString:`, date);
      return fallback;
    }
    
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Error in safeToISOString:', error, 'Date:', date);
    return fallback;
  }
};

/**
 * Safely subtracts days from a date
 * @param {any} date - Base date
 * @param {number} days - Days to subtract
 * @param {Date} fallback - Fallback date for invalid input
 * @returns {Date} - New date or fallback
 */
export const safeSubDays = (date, days, fallback = new Date()) => {
  try {
    if (!isValidDate(date) || typeof days !== 'number') {
      console.warn(`Invalid inputs provided to safeSubDays:`, date, days);
      return fallback;
    }
    
    return subDays(new Date(date), days);
  } catch (error) {
    console.error('Error in safeSubDays:', error, 'Date:', date, 'Days:', days);
    return fallback;
  }
};

/**
 * Safely sorts dates - handles invalid dates gracefully
 * @param {any} dateA - First date
 * @param {any} dateB - Second date
 * @returns {number} - Sort comparison result
 */
export const safeDateSort = (dateA, dateB) => {
  const validA = isValidDate(dateA);
  const validB = isValidDate(dateB);
  
  // Invalid dates sort to end
  if (!validA && !validB) return 0;
  if (!validA) return 1;
  if (!validB) return -1;
  
  try {
    return new Date(dateB) - new Date(dateA);
  } catch (error) {
    console.error('Error in safeDateSort:', error, 'Dates:', dateA, dateB);
    return 0;
  }
};