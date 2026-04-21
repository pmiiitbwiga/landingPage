import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' })); // Increased for larger photo uploads

  /**
   * Universal Proxy for Apps Script
   */
  const proxyToSheet = async (method: 'GET' | 'POST', reqBody: any, queryParams: any) => {
    const urlRaw = process.env.APPS_SCRIPT_URL?.trim();
    if (!urlRaw) {
      throw { status: 500, message: 'APPS_SCRIPT_URL tidak ditemukan di Secrets.', hint: 'Buka Settings > Secrets dan tambahkan APPS_SCRIPT_URL.' };
    }

    if (!urlRaw.includes('/macros/s/') || !urlRaw.includes('/exec')) {
      throw { status: 500, message: 'Format APPS_SCRIPT_URL salah.', hint: 'Pastikan Sahabat menyalin URL "Web App" (berakhiran /exec), bukan URL Editor.' };
    }

    const token = process.env.API_TOKEN?.trim();
    
    let fetchUrl = urlRaw;
    let options: RequestInit = { 
      method,
      redirect: 'follow',
      headers: { 'Accept': 'application/json' }
    };

    if (method === 'GET') {
      const params = new URLSearchParams(queryParams);
      if (token && !params.has('token')) params.append('token', token);
      const glue = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl += `${glue}${params.toString()}`;
    } else {
      const payload = { ...reqBody };
      if (token && !payload.token) payload.token = token;
      options.body = JSON.stringify(payload);
      options.headers = { ...options.headers, 'Content-Type': 'application/json' };
    }

    try {
      console.log(`[Proxy] ${method} to: ${fetchUrl.substring(0, 100)}...`);
      const response = await fetch(fetchUrl, options);
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`[Proxy] ${method} Success:`, Array.isArray(data) ? `Array(${data.length})` : 'Object');
        // Cek jika Apps Script mengirimkan error dalam JSON
        if (data && data.success === false) {
          throw { 
            status: 400, 
            message: data.message || 'Apps Script menolak permintaan.', 
            hint: 'Periksa apakah TOKEN di Apps Script sama dengan API_TOKEN di Secrets AI Studio.' 
          };
        }
        return data;
      } else {
        const text = await response.text();
        console.error(`Apps Script ${method} returned non-JSON:`, text.substring(0, 500));
        
        let hint = 'Pastikan Script sudah di-deploy sebagai Web App, Access: "Anyone", dan URL berakhiran "/exec".';
        if (text.includes('Google Accounts')) {
          hint = 'Akses Ditolak. Pastikan Sahabat memilih "Anyone" (bukan "Anyone with Google Account") pada kolom "Who has access" saat Deploy.';
        } else if (text.includes('script.google.com/home')) {
          hint = 'URL Salah. Sahabat menyalin URL Editor. Silakan klik Deploy > New Deployment, lalu salin URL Web App yang berakhiran "/exec".';
        }

        throw { status: 500, message: `Gagal mendapatkan JSON (${method}).`, hint, log: text.substring(0, 100) };
      }
    } catch (error: any) {
      if (error.status) throw error;
      console.error(`Fetch Error (${method}):`, error);
      throw { status: 500, message: 'Gagal terhubung ke jaringan Google Script.', hint: 'Periksa koneksi internet atau apakah Script masih aktif.' };
    }
  };

  app.post('/api/sheet', async (req, res) => {
    try {
      const data = await proxyToSheet('POST', req.body, null);
      res.json(data);
    } catch (err: any) {
      res.status(err.status || 500).json(err);
    }
  });

  app.get('/api/sheet', async (req, res) => {
    try {
      const data = await proxyToSheet('GET', null, req.query);
      res.json(data);
    } catch (err: any) {
      res.status(err.status || 500).json(err);
    }
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
