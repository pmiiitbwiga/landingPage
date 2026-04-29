export const formatDateForInput = (dateValue: any): string => {
  if (!dateValue) return '';
  
  // Handle Excel/Google Sheets serial date numbers (e.g. 38231)
  if (typeof dateValue === 'number' || (typeof dateValue === 'string' && !isNaN(Number(dateValue)) && Number(dateValue) < 100000 && Number(dateValue) > 10000)) {
    const d = new Date((Number(dateValue) - 25569) * 86400 * 1000);
    // Correct timezone issues by just grabbing ISO
    if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  }

  // Handle String YYYY-MM-DD
  if (typeof dateValue === 'string') {
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) return dateValue;
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}T/)) return dateValue.substring(0, 10);
    
    // Handle DD/MM/YYYY or DD-MM-YYYY
    const parts = dateValue.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  // Fallback try to parse
  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) {
    // try to get YYYY-MM-DD without UTC shift if possible, or just ISO
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return String(dateValue).substring(0, 10);
};
