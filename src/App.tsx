/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './app/(public)/LandingPage';
import { ContentDetail } from './app/(public)/ContentDetail';
import { AgendaDetail } from './app/(public)/AgendaDetail';
import { TentangPage } from './app/(public)/TentangPage';
import { ContentListPage } from './app/(public)/ContentListPage';
import { AgendaListPage } from './app/(public)/AgendaListPage';
import { MemberDashboard } from './app/member/MemberDashboard';
import { AdminDashboard } from './app/admin/AdminDashboard';
import { SearchProvider } from './lib/SearchContext';
import { AuthProvider } from './lib/AuthContext';
import { Toaster } from 'sonner';

import { AuthPage } from './app/auth/AuthPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors theme="light" />
          <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Pages */}
            <Route path="/login" element={<AuthPage />} />
            
            {/* Dashboard Pages */}
            <Route path="/member" element={
              <ProtectedRoute allowedRoles={['KADER', 'CALON', 'KADER EKSTERNAL', 'PENGURUS', 'ADMIN']}>
                <MemberDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PENGURUS']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Public Pages */}
            <Route path="/tentang" element={<TentangPage />} />
            <Route path="/berita" element={<ContentListPage type="Berita" title="Warta Pergerakan" />} />
            <Route path="/artikel" element={<ContentListPage type="Artikel" title="Goresan Tinta" />} />
            <Route path="/opini" element={<ContentListPage type="Opini" title="Opini & Gagasan" />} />
            <Route path="/agenda" element={<AgendaListPage />} />

            {/* Detail Pages */}
            <Route path="/berita/:slug" element={<ContentDetail type="berita" />} />
            <Route path="/artikel/:slug" element={<ContentDetail type="artikel" />} />
            <Route path="/opini/:slug" element={<ContentDetail type="opini" />} />
            <Route path="/agenda/:slug" element={<AgendaDetail />} />

            {/* Fallback */}
            <Route path="*" element={<div className="container mx-auto px-4 py-32 text-center text-gray-500"><h2 className="text-2xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h2><a href="/" className="text-primary hover:underline">Kembali ke Beranda</a></div>} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </SearchProvider>
  </AuthProvider>
  );
}
