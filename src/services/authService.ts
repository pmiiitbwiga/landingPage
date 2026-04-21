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
