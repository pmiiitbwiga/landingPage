import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method as 'GET' | 'POST';
  
  if (method !== 'GET' && method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const urlRaw = process.env.APPS_SCRIPT_URL?.trim() || process.env.VITE_GOOGLE_SCRIPT_URL?.trim();
  if (!urlRaw) {
    return res.status(500).json({ 
      status: 500, 
      message: 'APPS_SCRIPT_URL tidak ditemukan di Environment Variables.', 
      hint: 'Tambahkan APPS_SCRIPT_URL atau VITE_GOOGLE_SCRIPT_URL di Vercel Settings.' 
    });
  }

  if (!urlRaw.includes('/macros/s/') || !urlRaw.includes('/exec')) {
    return res.status(500).json({ 
      status: 500, 
      message: 'Format APPS_SCRIPT_URL salah.', 
      hint: 'Pastikan URL berakhiran /exec, bukan URL Editor.' 
    });
  }

  const token = process.env.API_TOKEN?.trim() || process.env.VITE_ADMIN_PASSKEY?.trim();
  
  let fetchUrl = urlRaw;
  const options: RequestInit = { 
    method,
    redirect: 'follow',
    headers: { 'Accept': 'application/json' }
  };

  if (method === 'GET') {
    const params = new URLSearchParams(req.query as Record<string, string>);
    if (token && !params.has('token')) params.append('token', token);
    const glue = fetchUrl.includes('?') ? '&' : '?';
    fetchUrl += `${glue}${params.toString()}`;
  } else {
    // method === 'POST'
    const payload = { ...req.body };
    if (token && !payload.token) payload.token = token;
    options.body = JSON.stringify(payload);
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
  }

  try {
    const response = await fetch(fetchUrl, options);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.success === false) {
        return res.status(400).json({ 
          status: 400, 
          message: data.message || 'Apps Script menolak permintaan.'
        });
      }
      return res.status(200).json(data);
    } else {
      const text = await response.text();
      let hint = 'Pastikan Script Access: "Anyone" dan URL /exec.';
      if (text.includes('Google Accounts')) {
        hint = 'Akses Ditolak. Pastikan "Anyone" saat deploy web app Apps Script.';
      }
      return res.status(500).json({ 
        status: 500, 
        message: `Gagal mendapatkan JSON (${method}).`, 
        hint 
      });
    }
  } catch (error: any) {
    if (error.status) return res.status(error.status).json(error);
    return res.status(500).json({ 
      status: 500, 
      message: 'Gagal terhubung ke jaringan Google Script.' 
    });
  }
}
