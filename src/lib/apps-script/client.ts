// Helper for Google Apps Script integration
export const fetchFromGAS = async (action: string, data?: any) => {
  const url = process.env.VITE_GAS_API_URL;
  if (!url) return null;
  
  try {
     const response = await fetch(url, {
         method: 'POST',
         body: JSON.stringify({ action, ...data }),
     });
     return await response.json();
  } catch (error) {
     console.error('GAS Integration Error:', error);
     return null;
  }
};
