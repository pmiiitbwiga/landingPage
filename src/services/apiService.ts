import { Post, Agenda, Member, Participation } from '../types';

export async function fetchFromSheet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({ action, t: Date.now().toString(), ...params });
  const response = await fetch(`/api/sheet?${queryParams.toString()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Gagal mengambil data dari server.');
  }
  
  return response.json();
}

export async function postToSheet<T>(action: string, data: any): Promise<T> {
  const response = await fetch('/api/sheet', {
    method: 'POST',
    body: JSON.stringify({ action, data }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.requireRegistration) {
      // If it throws 400 but has requireRegistration, just return the data normally
      return errorData;
    }
    const error = new Error(errorData.error || errorData.message || 'Gagal mengirim data ke server.');
    (error as any).details = errorData.hint || errorData.details;
    Object.assign(error, errorData);
    throw error;
  }

  return response.json();
}
