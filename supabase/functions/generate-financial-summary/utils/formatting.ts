
export function formatForPrompt(data: any) {
    if (!data) return 'Not provided';
    if (Array.isArray(data) && data.length === 0) return 'None';
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'object' && data !== null) {
      const filteredData = Array.isArray(data) 
        ? data.filter(item => Object.values(item).some(v => v !== '' && v !== null))
        : data;
      if (Array.isArray(filteredData) && filteredData.length === 0) return 'None';
      return JSON.stringify(filteredData, null, 2);
    }
    return String(data);
}
