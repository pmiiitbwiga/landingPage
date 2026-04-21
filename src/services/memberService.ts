import { Member } from '@/src/types';
import { fetchFromSheet, postToSheet } from './apiService';

export async function getMembers(): Promise<Member[]> {
  try {
    const members = await fetchFromSheet<Member[]>('get_members');
    return Array.isArray(members) ? members : [];
  } catch (error) {
    console.error('Get Members error:', error);
    return [];
  }
}

export async function createMember(data: any): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('create_member', data);
  } catch (error) {
    console.error('Create Member error:', error);
    throw error;
  }
}

export async function updateMember(uid: string, data: any): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('update_member', { uid, ...data });
  } catch (error) {
    console.error('Update Member error:', error);
    throw error;
  }
}

export async function deleteMember(uid: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('delete_member', { uid });
  } catch (error) {
    console.error('Delete Member error:', error);
    throw error;
  }
}
