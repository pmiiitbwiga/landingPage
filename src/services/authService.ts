import { Member } from '../types';
import { fetchFromSheet, postToSheet } from './apiService';

export async function loginWithEmail(email: string, password?: string): Promise<{ success: boolean; user?: Member; message?: string }> {
  try {
    const result = await postToSheet<any>('login', { email, password });
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Gagal terhubung ke server.' };
  }
}

export async function registerMember(data: Partial<Member>): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await postToSheet<any>('register', data);
    return result;
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Gagal mendaftarkan akun.' };
  }
}

export async function loginWithGoogle(email: string, name: string, picture?: string): Promise<{ success: boolean; requireRegistration?: boolean; user?: Member; message?: string; googleData?: any }> {
  try {
    const result = await postToSheet<any>('google_login', { email, name, picture });
    return result;
  } catch (error) {
    console.error('Google Login error:', error);
    return { success: false, message: 'Gagal memproses data Google.' };
  }
}
